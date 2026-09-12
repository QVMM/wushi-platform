import { useId, useMemo } from 'react'
import {
  BONE,
  IDX,
  JOINT,
  TEACHING_CONNECTIONS,
  getIdlePose,
  modeLabel,
  visibleEnough,
  type Landmark,
  type PoseMode,
} from '../lib/pose'

interface Props {
  active: boolean
  /** @deprecated phase-driven sine pose replaced by landmarks */
  phase?: number
  landmarks?: Landmark[] | null
  mode?: PoseMode
  className?: string
}

/** Teaching joints used for bbox auto-fit (upper body + legs). */
const FIT_JOINTS = [
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
] as const

/** Prefer torso/limb bones; drop nose–shoulder links that clutter when zoomed. */
const PANEL_CONNECTIONS: [number, number][] = TEACHING_CONNECTIONS.filter(
  ([a, b]) =>
    !(
      (a === IDX.nose && (b === IDX.leftShoulder || b === IDX.rightShoulder)) ||
      (b === IDX.nose && (a === IDX.leftShoulder || a === IDX.rightShoulder))
    ),
)

export function SkeletonPanel({
  active,
  landmarks,
  mode = 'idle',
  className = '',
}: Props) {
  const gradId = useId().replace(/:/g, '')
  const pose = useMemo(() => {
    if (landmarks && landmarks.length) return landmarks
    return getIdlePose()
  }, [landmarks])

  const showPose = active || Boolean(landmarks?.length)
  const label = active ? modeLabel(mode === 'idle' ? 'keyframe' : mode) : '姿态示意'

  // Auto-fit visible teaching joints into viewBox (~85% fill, uniform scale)
  const pts = useMemo(() => {
    const W = 320
    const H = 420
    const fill = 0.85

    const visible: { x: number; y: number; i: number }[] = []
    for (const i of FIT_JOINTS) {
      const lm = pose[i]
      if (!lm) continue
      const v = lm.visibility ?? 1
      if (!visibleEnough({ x: lm.x, y: lm.y, visibility: v })) continue
      visible.push({ x: lm.x, y: lm.y, i })
    }

    let minX = 0
    let maxX = 1
    let minY = 0
    let maxY = 1
    if (visible.length >= 2) {
      minX = Math.min(...visible.map((p) => p.x))
      maxX = Math.max(...visible.map((p) => p.x))
      minY = Math.min(...visible.map((p) => p.y))
      maxY = Math.max(...visible.map((p) => p.y))
    }

    const bw = Math.max(0.04, maxX - minX)
    const bh = Math.max(0.04, maxY - minY)
    // Padding around bbox before scaling to fill ratio
    const padFrac = 0.08
    const boxW = bw * (1 + padFrac * 2)
    const boxH = bh * (1 + padFrac * 2)
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2

    const scale = Math.min((W * fill) / boxW, (H * fill) / boxH)
    const map = (lm: Landmark) => {
      const x = W / 2 + (lm.x - cx) * scale
      const y = H / 2 + (lm.y - cy) * scale
      return { x, y, v: lm.visibility ?? 1 }
    }

    return {
      W,
      H,
      mapped: pose.map(map),
    }
  }, [pose])

  if (!showPose && !active) {
    return (
      <div className={`flex items-center justify-center bg-ink-elevated rounded-lg border border-ink-border ${className}`}>
        <div className="text-center text-mist text-sm px-4">
          <div className="font-serif text-gold-dim mb-2">姿态骨架</div>
          <p>开启骨架叠加以查看动作分析示意</p>
        </div>
      </div>
    )
  }

  const { mapped, W, H } = pts

  return (
    <div className={`relative bg-ink-elevated rounded-lg border border-ink-border overflow-hidden ${className}`}>
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <span className="text-[11px] text-gold-dim font-serif tracking-wider">{label}</span>
        {active && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              mode === 'track'
                ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.75)]'
                : mode === 'live'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                  : 'bg-gold/70'
            }`}
          />
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" aria-label="动作骨架示意">
        <defs>
          <linearGradient id={`bone-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8C97A" />
            <stop offset="100%" stopColor={BONE} />
          </linearGradient>
          <filter id={`glow-${gradId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* subtle floor cue near bottom of fitted figure */}
        <line x1={W * 0.22} y1={H * 0.94} x2={W * 0.78} y2={H * 0.94} stroke="#2A2E3A" strokeWidth="1" />

        <g filter={`url(#glow-${gradId})`} opacity={active ? 1 : 0.55}>
          {PANEL_CONNECTIONS.map(([a, b], i) => {
            const pa = mapped[a]
            const pb = mapped[b]
            if (!pa || !pb) return null
            if (!visibleEnough({ x: 0, y: 0, visibility: pa.v }) || !visibleEnough({ x: 0, y: 0, visibility: pb.v })) {
              return null
            }
            // Slight inset so bones don't meet in a blob at joints
            const dx = pb.x - pa.x
            const dy = pb.y - pa.y
            const len = Math.hypot(dx, dy) || 1
            const gap = Math.min(4.5, len * 0.08)
            const ux = dx / len
            const uy = dy / len
            return (
              <line
                key={i}
                x1={pa.x + ux * gap}
                y1={pa.y + uy * gap}
                x2={pb.x - ux * gap}
                y2={pb.y - uy * gap}
                stroke={`url(#bone-${gradId})`}
                strokeWidth="2"
                strokeLinecap="round"
              />
            )
          })}

          {/* Nose as a small head cue (no shoulder lines) */}
          {(() => {
            const p = mapped[IDX.nose]
            if (!p || !visibleEnough({ x: 0, y: 0, visibility: p.v })) return null
            return <circle cx={p.x} cy={p.y} r="2.25" fill={BONE} opacity={0.9} />
          })()}

          {[
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
          ].map((i) => {
            const p = mapped[i]
            if (!p || !visibleEnough({ x: 0, y: 0, visibility: p.v })) return null
            return (
              <circle key={i} cx={p.x} cy={p.y} r="2.4" fill={JOINT} />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
