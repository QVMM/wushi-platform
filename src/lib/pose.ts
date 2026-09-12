/** Pose landmarks, drawing, EMA, and keyframe interpolation for teaching skeleton UI */

export type PoseMode = 'track' | 'live' | 'keyframe' | 'idle'

export interface Landmark {
  x: number
  y: number
  z?: number
  visibility?: number
}

export const BONE = '#C6A15B'
export const JOINT = '#C23A2B'

/** MediaPipe-style landmark indices used for drawing */
export const IDX = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const

/** Elegant teaching skeleton connections (not full medical mesh) */
export const TEACHING_CONNECTIONS: [number, number][] = [
  [IDX.leftShoulder, IDX.rightShoulder],
  [IDX.leftShoulder, IDX.leftElbow],
  [IDX.leftElbow, IDX.leftWrist],
  [IDX.rightShoulder, IDX.rightElbow],
  [IDX.rightElbow, IDX.rightWrist],
  [IDX.leftShoulder, IDX.leftHip],
  [IDX.rightShoulder, IDX.rightHip],
  [IDX.leftHip, IDX.rightHip],
  [IDX.leftHip, IDX.leftKnee],
  [IDX.leftKnee, IDX.leftAnkle],
  [IDX.rightHip, IDX.rightKnee],
  [IDX.rightKnee, IDX.rightAnkle],
  [IDX.nose, IDX.leftShoulder],
  [IDX.nose, IDX.rightShoulder],
]

const LANDMARK_COUNT = 33

function blank(): Landmark[] {
  return Array.from({ length: LANDMARK_COUNT }, () => ({ x: 0.5, y: 0.5, visibility: 0 }))
}

function set(lm: Landmark[], i: number, x: number, y: number, v = 1): void {
  lm[i] = { x, y, z: 0, visibility: v }
}

/** Idle upright teaching pose (normalized 0–1, image coords) */
export function getIdlePose(): Landmark[] {
  const lm = blank()
  set(lm, IDX.nose, 0.5, 0.18)
  set(lm, IDX.leftShoulder, 0.4, 0.3)
  set(lm, IDX.rightShoulder, 0.6, 0.3)
  set(lm, IDX.leftElbow, 0.32, 0.42)
  set(lm, IDX.rightElbow, 0.68, 0.42)
  set(lm, IDX.leftWrist, 0.28, 0.52)
  set(lm, IDX.rightWrist, 0.72, 0.52)
  set(lm, IDX.leftHip, 0.44, 0.55)
  set(lm, IDX.rightHip, 0.56, 0.55)
  set(lm, IDX.leftKnee, 0.43, 0.72)
  set(lm, IDX.rightKnee, 0.57, 0.72)
  set(lm, IDX.leftAnkle, 0.42, 0.9)
  set(lm, IDX.rightAnkle, 0.58, 0.9)
  return lm
}

/** Authored keyframe poses — lion-dance teaching silhouettes */
function poseHoldFrame(): Landmark[] {
  const lm = blank()
  set(lm, IDX.nose, 0.5, 0.16)
  set(lm, IDX.leftShoulder, 0.38, 0.28)
  set(lm, IDX.rightShoulder, 0.62, 0.28)
  set(lm, IDX.leftElbow, 0.28, 0.38)
  set(lm, IDX.rightElbow, 0.72, 0.38)
  set(lm, IDX.leftWrist, 0.22, 0.32)
  set(lm, IDX.rightWrist, 0.78, 0.32)
  set(lm, IDX.leftHip, 0.43, 0.52)
  set(lm, IDX.rightHip, 0.57, 0.52)
  set(lm, IDX.leftKnee, 0.4, 0.7)
  set(lm, IDX.rightKnee, 0.6, 0.7)
  set(lm, IDX.leftAnkle, 0.38, 0.9)
  set(lm, IDX.rightAnkle, 0.62, 0.9)
  return lm
}

function poseSink(): Landmark[] {
  const lm = blank()
  set(lm, IDX.nose, 0.5, 0.22)
  set(lm, IDX.leftShoulder, 0.37, 0.34)
  set(lm, IDX.rightShoulder, 0.63, 0.34)
  set(lm, IDX.leftElbow, 0.27, 0.44)
  set(lm, IDX.rightElbow, 0.73, 0.44)
  set(lm, IDX.leftWrist, 0.22, 0.36)
  set(lm, IDX.rightWrist, 0.78, 0.36)
  set(lm, IDX.leftHip, 0.42, 0.58)
  set(lm, IDX.rightHip, 0.58, 0.58)
  set(lm, IDX.leftKnee, 0.36, 0.74)
  set(lm, IDX.rightKnee, 0.64, 0.74)
  set(lm, IDX.leftAnkle, 0.34, 0.92)
  set(lm, IDX.rightAnkle, 0.66, 0.92)
  return lm
}

function poseTurn(): Landmark[] {
  const lm = blank()
  set(lm, IDX.nose, 0.56, 0.17)
  set(lm, IDX.leftShoulder, 0.42, 0.29)
  set(lm, IDX.rightShoulder, 0.64, 0.31)
  set(lm, IDX.leftElbow, 0.3, 0.4)
  set(lm, IDX.rightElbow, 0.74, 0.42)
  set(lm, IDX.leftWrist, 0.24, 0.3)
  set(lm, IDX.rightWrist, 0.8, 0.34)
  set(lm, IDX.leftHip, 0.44, 0.54)
  set(lm, IDX.rightHip, 0.58, 0.55)
  set(lm, IDX.leftKnee, 0.4, 0.72)
  set(lm, IDX.rightKnee, 0.62, 0.71)
  set(lm, IDX.leftAnkle, 0.38, 0.9)
  set(lm, IDX.rightAnkle, 0.64, 0.89)
  return lm
}

function poseLift(): Landmark[] {
  const lm = blank()
  set(lm, IDX.nose, 0.5, 0.12)
  set(lm, IDX.leftShoulder, 0.36, 0.24)
  set(lm, IDX.rightShoulder, 0.64, 0.24)
  set(lm, IDX.leftElbow, 0.3, 0.18)
  set(lm, IDX.rightElbow, 0.7, 0.18)
  set(lm, IDX.leftWrist, 0.34, 0.1)
  set(lm, IDX.rightWrist, 0.66, 0.1)
  set(lm, IDX.leftHip, 0.43, 0.5)
  set(lm, IDX.rightHip, 0.57, 0.5)
  set(lm, IDX.leftKnee, 0.42, 0.7)
  set(lm, IDX.rightKnee, 0.58, 0.7)
  set(lm, IDX.leftAnkle, 0.41, 0.9)
  set(lm, IDX.rightAnkle, 0.59, 0.9)
  return lm
}

function poseStep(): Landmark[] {
  const lm = blank()
  set(lm, IDX.nose, 0.48, 0.17)
  set(lm, IDX.leftShoulder, 0.36, 0.29)
  set(lm, IDX.rightShoulder, 0.6, 0.29)
  set(lm, IDX.leftElbow, 0.26, 0.4)
  set(lm, IDX.rightElbow, 0.7, 0.4)
  set(lm, IDX.leftWrist, 0.2, 0.34)
  set(lm, IDX.rightWrist, 0.76, 0.34)
  set(lm, IDX.leftHip, 0.42, 0.54)
  set(lm, IDX.rightHip, 0.56, 0.54)
  set(lm, IDX.leftKnee, 0.34, 0.7)
  set(lm, IDX.rightKnee, 0.64, 0.72)
  set(lm, IDX.leftAnkle, 0.28, 0.88)
  set(lm, IDX.rightAnkle, 0.68, 0.9)
  return lm
}

function poseBow(): Landmark[] {
  const lm = blank()
  set(lm, IDX.nose, 0.5, 0.28)
  set(lm, IDX.leftShoulder, 0.38, 0.36)
  set(lm, IDX.rightShoulder, 0.62, 0.36)
  set(lm, IDX.leftElbow, 0.3, 0.46)
  set(lm, IDX.rightElbow, 0.7, 0.46)
  set(lm, IDX.leftWrist, 0.34, 0.4)
  set(lm, IDX.rightWrist, 0.66, 0.4)
  set(lm, IDX.leftHip, 0.44, 0.56)
  set(lm, IDX.rightHip, 0.56, 0.56)
  set(lm, IDX.leftKnee, 0.42, 0.72)
  set(lm, IDX.rightKnee, 0.58, 0.72)
  set(lm, IDX.leftAnkle, 0.4, 0.9)
  set(lm, IDX.rightAnkle, 0.6, 0.9)
  return lm
}

const AUTHORED_CYCLE = [poseHoldFrame, poseSink, poseStep, poseTurn, poseLift, poseBow, poseHoldFrame]

export function authoredPoseAtIndex(i: number): Landmark[] {
  const fn = AUTHORED_CYCLE[((i % AUTHORED_CYCLE.length) + AUTHORED_CYCLE.length) % AUTHORED_CYCLE.length]
  return fn()
}

export function lerpLandmarks(a: Landmark[], b: Landmark[], t: number): Landmark[] {
  const n = Math.max(a.length, b.length, LANDMARK_COUNT)
  const out: Landmark[] = []
  const u = Math.max(0, Math.min(1, t))
  for (let i = 0; i < n; i++) {
    const pa = a[i] ?? { x: 0.5, y: 0.5, visibility: 0 }
    const pb = b[i] ?? { x: 0.5, y: 0.5, visibility: 0 }
    out.push({
      x: pa.x + (pb.x - pa.x) * u,
      y: pa.y + (pb.y - pa.y) * u,
      z: (pa.z ?? 0) + ((pb.z ?? 0) - (pa.z ?? 0)) * u,
      visibility: Math.min(pa.visibility ?? 1, pb.visibility ?? 1),
    })
  }
  return out
}

/** Smooth interpolation between authored poses keyed by lesson keyframe times */
export function interpolateAuthoredPose(times: number[], currentTime: number): Landmark[] {
  if (!times.length) return getIdlePose()
  if (times.length === 1) return authoredPoseAtIndex(0)

  const sorted = times
    .map((t, i) => ({ t, i }))
    .sort((a, b) => a.t - b.t)

  if (currentTime <= sorted[0].t) return authoredPoseAtIndex(sorted[0].i)
  if (currentTime >= sorted[sorted.length - 1].t) {
    return authoredPoseAtIndex(sorted[sorted.length - 1].i)
  }

  for (let k = 0; k < sorted.length - 1; k++) {
    const a = sorted[k]
    const b = sorted[k + 1]
    if (currentTime >= a.t && currentTime <= b.t) {
      const span = b.t - a.t || 1
      const u = (currentTime - a.t) / span
      // Smoothstep for premium feel
      const s = u * u * (3 - 2 * u)
      return lerpLandmarks(authoredPoseAtIndex(a.i), authoredPoseAtIndex(b.i), s)
    }
  }
  return authoredPoseAtIndex(sorted[sorted.length - 1].i)
}

export function cloneLandmarks(src: Landmark[]): Landmark[] {
  return src.map((p) => ({ x: p.x, y: p.y, z: p.z, visibility: p.visibility }))
}

export function createEmaFilter(alpha = 0.35) {
  let state: Landmark[] | null = null
  return {
    reset() {
      state = null
    },
    filter(next: Landmark[]): Landmark[] {
      if (!state || state.length !== next.length) {
        state = cloneLandmarks(next)
        return state
      }
      for (let i = 0; i < next.length; i++) {
        const prev = state[i]
        const cur = next[i]
        state[i] = {
          x: prev.x + (cur.x - prev.x) * alpha,
          y: prev.y + (cur.y - prev.y) * alpha,
          z: (prev.z ?? 0) + ((cur.z ?? 0) - (prev.z ?? 0)) * alpha,
          visibility: cur.visibility ?? prev.visibility,
        }
      }
      return state
    },
  }
}

export function visibleEnough(lm: Landmark | undefined, min = 0.22): boolean {
  if (!lm) return false
  if (lm.visibility == null) return true
  return lm.visibility >= min
}

/** Draw premium gold/vermillion skeleton onto a canvas (pixel size = canvas) */
export function drawPoseCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  width: number,
  height: number,
  opts?: { mirrorX?: boolean },
): void {
  ctx.clearRect(0, 0, width, height)
  if (!landmarks.length) return

  const px = (lm: Landmark) => (opts?.mirrorX ? 1 - lm.x : lm.x) * width
  const py = (lm: Landmark) => lm.y * height

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Soft glow pass (thicker, more visible)
  ctx.shadowColor = 'rgba(198, 161, 91, 0.75)'
  ctx.shadowBlur = 18
  ctx.strokeStyle = BONE
  ctx.lineWidth = 4.5

  for (const [a, b] of TEACHING_CONNECTIONS) {
    const la = landmarks[a]
    const lb = landmarks[b]
    if (!visibleEnough(la) || !visibleEnough(lb)) continue
    ctx.beginPath()
    ctx.moveTo(px(la), py(la))
    ctx.lineTo(px(lb), py(lb))
    ctx.stroke()
  }

  // Joints
  ctx.shadowColor = 'rgba(194, 58, 43, 0.55)'
  ctx.shadowBlur = 14
  const joints = [
    IDX.nose,
    IDX.leftShoulder,
    IDX.rightShoulder,
    IDX.leftElbow,
    IDX.rightElbow,
    IDX.leftWrist,
    IDX.rightWrist,
    IDX.leftHip,
    IDX.rightHip,
    IDX.leftKnee,
    IDX.rightKnee,
    IDX.leftAnkle,
    IDX.rightAnkle,
  ]
  for (const i of joints) {
    const lm = landmarks[i]
    if (!visibleEnough(lm)) continue
    const x = px(lm)
    const y = py(lm)
    ctx.beginPath()
    ctx.fillStyle = '#0B0C0F'
    ctx.arc(x, y, 5.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.strokeStyle = JOINT
    ctx.lineWidth = 2
    ctx.arc(x, y, 4.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.fillStyle = BONE
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

export function modeLabel(mode: PoseMode): string {
  if (mode === 'track') return '动作示意'
  if (mode === 'live') return '动作示意'
  if (mode === 'keyframe') return '关键帧驱动'
  return '姿态示意'
}

/** Compact offline pose track JSON shape */
export interface PoseTrackFrame {
  t: number
  lm: number[][] // [[x,y,z,v], ...] length 33
}

export interface PoseTrack {
  fps: number
  duration: number
  frames: PoseTrackFrame[]
}

function lmFromArray(row: number[] | undefined): Landmark {
  if (!row || row.length < 2) return { x: 0.5, y: 0.5, z: 0, visibility: 0 }
  return {
    x: row[0],
    y: row[1],
    z: row[2] ?? 0,
    visibility: row[3] ?? 1,
  }
}

export function poseTrackFrameToLandmarks(frame: PoseTrackFrame): Landmark[] {
  const out: Landmark[] = []
  for (let i = 0; i < LANDMARK_COUNT; i++) {
    out.push(lmFromArray(frame.lm[i]))
  }
  return out
}

/** Binary-search nearest frames and lerp by currentTime (instant seek-friendly) */
export function interpolatePoseTrack(track: PoseTrack, currentTime: number): Landmark[] {
  const frames = track.frames
  if (!frames.length) return getIdlePose()
  if (frames.length === 1 || currentTime <= frames[0].t) {
    return poseTrackFrameToLandmarks(frames[0])
  }
  if (currentTime >= frames[frames.length - 1].t) {
    return poseTrackFrameToLandmarks(frames[frames.length - 1])
  }

  let lo = 0
  let hi = frames.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (frames[mid].t <= currentTime) lo = mid
    else hi = mid
  }
  const a = frames[lo]
  const b = frames[hi]
  const span = b.t - a.t || 1
  const u = (currentTime - a.t) / span
  const s = u * u * (3 - 2 * u)
  return lerpLandmarks(poseTrackFrameToLandmarks(a), poseTrackFrameToLandmarks(b), s)
}
