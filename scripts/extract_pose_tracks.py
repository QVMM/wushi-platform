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

# Consecutive frames with terrible continuity before allowing a person switch
HYSTERESIS_FRAMES = 5
# Continuity score below this counts as "terrible" (normalized 0–1 distance/IoU blend)
SWITCH_THRESHOLD = 0.18


def torso_center_and_bbox(landmarks, w: int, h: int):
    """Return (cx, cy, bbox) for torso (shoulders+hips), or None."""
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
        xs, ys = [], []
        for lm in landmarks:
            v = getattr(lm, "visibility", 1.0) or 0.0
            if v < 0.3:
                continue
            xs.append(lm.x * w)
            ys.append(lm.y * h)
        if len(xs) < 2:
            return None
        minx, maxx = min(xs), max(xs)
        miny, maxy = min(ys), max(ys)
        cx = (minx + maxx) / 2
        cy = (miny + maxy) / 2
        return cx, cy, (minx, miny, maxx, maxy)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    minx, maxx = min(xs), max(xs)
    miny, maxy = min(ys), max(ys)
    # Expand slightly so bbox has area even if points are colinear
    if maxx - minx < 8:
        mid = (minx + maxx) / 2
        minx, maxx = mid - 4, mid + 4
    if maxy - miny < 8:
        mid = (miny + maxy) / 2
        miny, maxy = mid - 4, mid + 4
    cx = sum(xs) / len(xs)
    cy = sum(ys) / len(ys)
    return cx, cy, (minx, miny, maxx, maxy)


def bbox_iou(a, b) -> float:
    if a is None or b is None:
        return 0.0
    ax0, ay0, ax1, ay1 = a
    bx0, by0, bx1, by1 = b
    ix0, iy0 = max(ax0, bx0), max(ay0, by0)
    ix1, iy1 = min(ax1, bx1), min(ay1, by1)
    iw, ih = max(0.0, ix1 - ix0), max(0.0, iy1 - iy0)
    inter = iw * ih
    if inter <= 0:
        return 0.0
    area_a = max(1e-6, (ax1 - ax0) * (ay1 - ay0))
    area_b = max(1e-6, (bx1 - bx0) * (by1 - by0))
    return inter / (area_a + area_b - inter)


def torso_score(landmarks, w: int, h: int) -> float:
    """Prefer largest torso bbox near frame center (first-frame / reacquire)."""
    info = torso_center_and_bbox(landmarks, w, h)
    if info is None:
        return -1.0
    cx, cy, (minx, miny, maxx, maxy) = info
    area = max(1.0, (maxx - minx) * (maxy - miny))
    dist = math.hypot(cx - w / 2, cy - h / 2)
    return area - dist * 8.0


def continuity_score(landmarks, w: int, h: int, prev_center, prev_bbox) -> float:
    """
    Score favoring spatial continuity with the locked person.
    Returns ~0–1+ where higher is better match to prev.
    """
    info = torso_center_and_bbox(landmarks, w, h)
    if info is None or prev_center is None:
        return -1.0
    cx, cy, bbox = info
    diag = math.hypot(w, h) or 1.0
    dist = math.hypot(cx - prev_center[0], cy - prev_center[1])
    # 1 when identical center, decays as distance grows (half-life ~0.15 of diagonal)
    dist_score = math.exp(-dist / (0.12 * diag))
    iou = bbox_iou(bbox, prev_bbox) if prev_bbox is not None else 0.0
    # Mild size preference: larger torso slightly better among near-equal continuity
    area = max(1.0, (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]))
    size_bonus = min(0.15, area / (w * h) * 2.0)
    return 0.65 * dist_score + 0.35 * iou + size_bonus


def pick_pose(
    pose_landmarks_list,
    w: int,
    h: int,
    prev_center=None,
    prev_bbox=None,
    bad_streak: int = 0,
):
    """
    Lock onto one person across frames.
    First frame (no prev): largest torso near center.
    Later: heavily prefer continuity; only switch after HYSTERESIS_FRAMES of terrible scores.
    Returns (landmarks | None, new_center, new_bbox, new_bad_streak).
    """
    if not pose_landmarks_list:
        return None, prev_center, prev_bbox, bad_streak + 1 if prev_center is not None else 0

    if prev_center is None:
        best = None
        best_s = -1e18
        for pl in pose_landmarks_list:
            s = torso_score(pl, w, h)
            if s > best_s:
                best_s = s
                best = pl
        if best is None:
            return None, None, None, 0
        info = torso_center_and_bbox(best, w, h)
        if info is None:
            return best, None, None, 0
        cx, cy, bbox = info
        return best, (cx, cy), bbox, 0

    # Score all detections by continuity
    scored = []
    for pl in pose_landmarks_list:
        s = continuity_score(pl, w, h, prev_center, prev_bbox)
        scored.append((s, pl))
    scored.sort(key=lambda x: x[0], reverse=True)
    best_s, best = scored[0]

    if best_s >= SWITCH_THRESHOLD:
        info = torso_center_and_bbox(best, w, h)
        if info is None:
            return best, prev_center, prev_bbox, 0
        cx, cy, bbox = info
        return best, (cx, cy), bbox, 0

    # Continuity terrible — stick with best continuity candidate unless hysteresis exhausted
    new_streak = bad_streak + 1
    if new_streak < HYSTERESIS_FRAMES:
        # Still prefer best continuity match (even if weak) to avoid flicker
        info = torso_center_and_bbox(best, w, h)
        if info is None:
            return best, prev_center, prev_bbox, new_streak
        cx, cy, bbox = info
        return best, (cx, cy), bbox, new_streak

    # Reacquire: pick by torso_score (size+center), allow person switch
    reacq = None
    reacq_s = -1e18
    for pl in pose_landmarks_list:
        s = torso_score(pl, w, h)
        if s > reacq_s:
            reacq_s = s
            reacq = pl
    chosen = reacq if reacq is not None else best
    info = torso_center_and_bbox(chosen, w, h)
    if info is None:
        return chosen, prev_center, prev_bbox, 0
    cx, cy, bbox = info
    return chosen, (cx, cy), bbox, 0


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
    prev_center = None
    prev_bbox = None
    bad_streak = 0

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
            chosen, prev_center, prev_bbox, bad_streak = pick_pose(
                result.pose_landmarks or [],
                w,
                h,
                prev_center=prev_center,
                prev_bbox=prev_bbox,
                bad_streak=bad_streak,
            )
            if chosen is not None:
                lm = landmarks_to_lm(chosen)
                last_lm = lm
            else:
                lm = last_lm
                # No detection: keep prev lock; bump bad streak lightly
                if prev_center is not None:
                    bad_streak = min(bad_streak + 1, HYSTERESIS_FRAMES)
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
