import { useMemo } from 'react'

/** Simplified side-view stick figure for motion analysis */
interface Props {
  active: boolean
  phase: number // 0–1 progress through keyframes
  className?: string
}

export function SkeletonPanel({ active, phase, className = '' }: Props) {
  const pose = useMemo(() => {
    // Interpolate a few joint positions based on phase
    const t = phase
    const kneeBend = 20 + Math.sin(t * Math.PI * 2) * 18
    const armLift = -10 + Math.sin(t * Math.PI * 2 + 0.5) * 25
    const headTilt = Math.sin(t * Math.PI * 2) * 8
    const torsoLean = Math.sin(t * Math.PI * 2 + 0.3) * 4
    return { kneeBend, armLift, headTilt, torsoLean }
  }, [phase])

  if (!active) {
    return (
      <div className={`flex items-center justify-center bg-ink-elevated rounded-lg border border-ink-border ${className}`}>
        <div className="text-center text-mist text-sm px-4">
          <div className="font-serif text-gold-dim mb-2">姿态骨架</div>
          <p>开启骨架叠加以查看动作分析示意</p>
        </div>
      </div>
    )
  }

  const cx = 120
  const hipY = 140
  const shoulderY = 80 + pose.torsoLean

  return (
    <div className={`relative bg-ink-elevated rounded-lg border border-ink-border overflow-hidden ${className}`}>
      <div className="absolute top-3 left-3 text-[11px] text-gold-dim font-serif tracking-wider">
        姿态骨架 · 示意
      </div>
      <svg viewBox="0 0 240 280" className="w-full h-full" aria-label="动作骨架示意">
        <defs>
          <linearGradient id="bone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C6A15B" />
            <stop offset="100%" stopColor="#C23A2B" />
          </linearGradient>
        </defs>
        {/* ground */}
        <line x1="40" y1="250" x2="200" y2="250" stroke="#2A2E3A" strokeWidth="1" />

        {/* torso */}
        <line
          x1={cx}
          y1={shoulderY}
          x2={cx + pose.torsoLean}
          y2={hipY}
          stroke="url(#bone)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* head / lion frame hint */}
        <ellipse
          cx={cx + pose.headTilt}
          cy={shoulderY - 28}
          rx="22"
          ry="18"
          fill="none"
          stroke="#C23A2B"
          strokeWidth="2"
          opacity="0.85"
        />
        <circle cx={cx + pose.headTilt - 8} cy={shoulderY - 30} r="2.5" fill="#C6A15B" />
        <circle cx={cx + pose.headTilt + 8} cy={shoulderY - 30} r="2.5" fill="#C6A15B" />

        {/* arms holding frame */}
        <line
          x1={cx}
          y1={shoulderY}
          x2={cx - 45}
          y2={shoulderY + 20 + pose.armLift}
          stroke="url(#bone)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1={cx}
          y1={shoulderY}
          x2={cx + 45}
          y2={shoulderY + 20 + pose.armLift}
          stroke="url(#bone)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* frame bar */}
        <line
          x1={cx - 50}
          y1={shoulderY + 18 + pose.armLift}
          x2={cx + 50}
          y2={shoulderY + 18 + pose.armLift}
          stroke="#C6A15B"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.7"
        />

        {/* legs */}
        <line
          x1={cx + pose.torsoLean}
          y1={hipY}
          x2={cx - 25}
          y2={hipY + 55 - pose.kneeBend * 0.3}
          stroke="url(#bone)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1={cx - 25}
          y1={hipY + 55 - pose.kneeBend * 0.3}
          x2={cx - 30}
          y2={245}
          stroke="url(#bone)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1={cx + pose.torsoLean}
          y1={hipY}
          x2={cx + 28}
          y2={hipY + 50 - pose.kneeBend * 0.2}
          stroke="url(#bone)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1={cx + 28}
          y1={hipY + 50 - pose.kneeBend * 0.2}
          x2={cx + 35}
          y2={245}
          stroke="url(#bone)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* joints */}
        {[
          [cx, shoulderY],
          [cx + pose.torsoLean, hipY],
          [cx - 45, shoulderY + 20 + pose.armLift],
          [cx + 45, shoulderY + 20 + pose.armLift],
          [cx - 25, hipY + 55 - pose.kneeBend * 0.3],
          [cx + 28, hipY + 50 - pose.kneeBend * 0.2],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#0B0C0F" stroke="#C6A15B" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  )
}
