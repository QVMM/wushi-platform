interface Props {
  value: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({ value, className = '', showLabel }: Props) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 rounded-full bg-ink-border overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-vermillion to-gold transition-all duration-500"
          style={{ width: `${v}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-mist tabular-nums w-8 text-right">{v}%</span>}
    </div>
  )
}
