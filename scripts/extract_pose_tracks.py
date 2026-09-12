#!/usr/bin/env python3
"""Offline MediaPipe Pose Landmarker → compact JSON pose tracks."""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
from typing import Any

import cv2
import numpy as np
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.core import base_options as base_options_module
from mediapipe.tasks.python.vision.core import vision_task_running_mode as running_mode_module

BaseOptions = base_options_module.BaseOptions
PoseLandmarker = vision.PoseLandmarker
PoseLandmarkerOptions = vision.PoseLandmarkerOptions
RunningMode = running_mode_module.VisionTaskRunningMode
MPImage = __import__("mediapipe").Image
ImageFormat = __import__("mediapipe").ImageFormat


def torso_score(landmarks, w: int, h: int) -> float:
    """Prefer largest torso bbox near frame center."""
    # shoulders 11,12 hips 23,24
    idxs = [11, 12, 23, 24]
    pts = []
    for i in idxs:
        if i >= len(landmarks):
            continue
        lm = landmarks[i]
        v = getattr(lm, "visibility", 1.0) or 0.0
        if v < 0.2:
            continue
        pts.append((lm.x * w, lm.y * h))
    if len(pts) < 2:
        # fallback: all visible points extent
        xs, ys = [], []
        for lm in landmarks:
            v = getattr(lm, "visibility", 1.0) or 0.0
            if v < 0.3:
                continue
            xs.append(lm.x * w)
            ys.append(lm.y * h)
        if len(xs) < 2:
            return -1.0
        area = (max(xs) - min(xs)) * (max(ys) - min(ys))
        cx = (min(xs) + max(xs)) / 2
        cy = (min(ys) + max(ys)) / 2
    else:
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        area = max(1.0, (max(xs) - min(xs)) * (max(ys) - min(ys)))
        cx = sum(xs) / len(xs)
        cy = sum(ys) / len(ys)
    dist = math.hypot(cx - w / 2, cy - h / 2)
    # larger area, closer to center
    return area - dist * 8.0


def pick_pose(pose_landmarks_list, w: int, h: int):
    if not pose_landmarks_list:
        return None
    best = None
    best_s = -1e18
    for pl in pose_landmarks_list:
        s = torso_score(pl, w, h)
        if s > best_s:
            best_s = s
            best = pl
    return best


def round4(x: float) -> float:
    return float(f"{x:.4f}")


def landmarks_to_lm(landmarks) -> list[list[float]]:
    out = []
    for lm in landmarks:
        v = getattr(lm, "visibility", None)
        if v is None:
            v = getattr(lm, "presence", 1.0) or 1.0
        out.append([
            round4(float(lm.x)),
            round4(float(lm.y)),
            round4(float(lm.z)),
            round4(float(v)),
        ])
    # pad/truncate to 33
    while len(out) < 33:
        out.append([0.5, 0.5, 0.0, 0.0])
    return out[:33]


def extract(
    video_path: str,
    out_path: str,
    model_path: str,
    target_fps: float = 6.0,
    max_seconds: float | None = None,
    num_poses: int = 4,
) -> dict[str, Any]:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open {video_path}")

    src_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = frame_count / src_fps if src_fps > 0 else 0.0
    if max_seconds is not None:
        duration = min(duration, max_seconds)

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=RunningMode.VIDEO,
        num_poses=num_poses,
        min_pose_detection_confidence=0.4,
        min_pose_presence_confidence=0.4,
        min_tracking_confidence=0.4,
    )
    landmarker = PoseLandmarker.create_from_options(options)

    step = max(1, int(round(src_fps / target_fps)))
    effective_fps = src_fps / step
    frames: list[dict[str, Any]] = []
    idx = 0
    written = 0
    last_lm = None

    while True:
        ok, bgr = cap.read()
        if not ok:
            break
        t = idx / src_fps
        if max_seconds is not None and t > max_seconds:
            break
        if idx % step == 0:
            rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            h, w = rgb.shape[:2]
            mp_image = MPImage(image_format=ImageFormat.SRGB, data=rgb)
            ts_ms = int(t * 1000)
            result = landmarker.detect_for_video(mp_image, ts_ms)
            chosen = pick_pose(result.pose_landmarks or [], w, h)
            if chosen is not None:
                lm = landmarks_to_lm(chosen)
                last_lm = lm
            else:
                lm = last_lm
            if lm is not None:
                frames.append({"t": round4(t), "lm": lm})
                written += 1
                if written % 40 == 0:
                    print(f"  … {written} frames @ t={t:.1f}s", flush=True)
        idx += 1

    cap.release()
    landmarker.close()

    # If sparse gaps, ensure we have something
    if not frames:
        raise RuntimeError(f"No poses detected in {video_path}")

    payload = {
        "fps": round4(effective_fps),
        "duration": round4(frames[-1]["t"] if frames else duration),
        "frames": frames,
    }

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"))

    size = os.path.getsize(out_path)
    print(
        f"Wrote {out_path}: {len(frames)} frames, duration={payload['duration']}s, "
        f"fps≈{payload['fps']}, size={size/1024/1024:.2f}MB"
    )
    return payload


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="/workspace/wushi-platform/models/pose_landmarker_lite.task")
    ap.add_argument("--fps", type=float, default=6.0)
    ap.add_argument("--max-seconds", type=float, default=None)
    args = ap.parse_args()
    extract(args.video, args.out, args.model, target_fps=args.fps, max_seconds=args.max_seconds)
    return 0


if __name__ == "__main__":
    sys.exit(main())
