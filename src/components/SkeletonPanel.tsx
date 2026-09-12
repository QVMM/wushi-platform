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

  // Map normalized landmarks into panel viewBox (front teaching view)
  const pts = useMemo(() => {
    const W = 240
    const H = 280
    const padX = 20
    const padY = 36
    const innerW = W - padX * 2
    const innerH = H - padY - 30

    // Fit teaching figure into panel with slight vertical bias
    const map = (lm: Landmark) => ({
      x: padX + lm.x * innerW,
      y: padY + lm.y * innerH,
      v: lm.visibility ?? 1,
    })

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
          <linearGradient id={`bone-${gradId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={BONE} />
            <stop offset="100%" stopColor={JOINT} />
          </linearGradient>
          <filter id={`glow-${gradId}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.0" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <line x1="40" y1="250" x2="200" y2="250" stroke="#2A2E3A" strokeWidth="1" />

        <g filter={`url(#glow-${gradId})`} opacity={active ? 1 : 0.55}>
          {TEACHING_CONNECTIONS.map(([a, b], i) => {
            const pa = mapped[a]
            const pb = mapped[b]
            if (!pa || !pb) return null
            if (!visibleEnough({ x: 0, y: 0, visibility: pa.v }) || !visibleEnough({ x: 0, y: 0, visibility: pb.v })) {
              return null
            }
            return (
              <line
                key={i}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={`url(#bone-${gradId})`}
                strokeWidth="3.25"
                strokeLinecap="round"
              />
            )
          })}

          {[
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
          ].map((i) => {
            const p = mapped[i]
            if (!p || !visibleEnough({ x: 0, y: 0, visibility: p.v })) return null
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="#0B0C0F" stroke={JOINT} strokeWidth="1.6" />
                <circle cx={p.x} cy={p.y} r="2" fill={BONE} />
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
