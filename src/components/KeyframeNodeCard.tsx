import { formatTime, type Keyframe, type KeyframeNode } from '../data/lessons'

interface Props {
  keyframe: Keyframe | null
  visible?: boolean
  className?: string
}

export function KeyframeNodeCard({ keyframe, visible = true, className = '' }: Props) {
  if (!visible) {
    return (
      <div
        className={`rounded-xl border border-ink-border bg-ink-elevated p-6 text-center text-sm text-mist ${className}`}
      >
        <div className="font-serif text-gold-dim mb-1">关键帧分析</div>
        <p>开启「节点分析」以查看关节标注与要领提示</p>
      </div>
    )
  }

  if (!keyframe) {
    return (
      <div
        className={`rounded-xl border border-ink-border bg-ink-elevated p-6 text-center text-sm text-mist ${className}`}
      >
        <div className="font-serif text-gold-dim mb-1">关键帧分析</div>
        <p>暂无关键帧</p>
      </div>
    )
  }

  const nodes: KeyframeNode[] = keyframe.nodes ?? []

  return (
    <section className={`rounded-xl border border-ink-border bg-ink-elevated overflow-hidden ${className}`}>
      <div className="px-3 pt-3 pb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] text-gold-dim font-serif tracking-wider">关键帧分析 · 关节节点</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] tabular-nums text-gold">{formatTime(keyframe.time)}</span>
            <span className="font-serif text-sm text-paper truncate">{keyframe.label}</span>
          </div>
        </div>
        <span className="text-[10px] text-mist shrink-0 tabular-nums">{nodes.length} 节点</span>
      </div>

      <div className="relative mx-3 mb-3 rounded-lg overflow-hidden border border-ink-border bg-black aspect-video">
        <img
          src={keyframe.image}
          alt={keyframe.label}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />
        {nodes.map((n, i) => (
          <div
            key={n.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}
          >
            <div className="relative flex flex-col items-center">
              <span className="w-6 h-6 rounded-full bg-vermillion/95 text-white text-[11px] font-medium flex items-center justify-center border-2 border-gold/80 shadow-[0_0_10px_rgba(194,58,43,0.55)]">
                {i + 1}
              </span>
              <span className="mt-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] text-gold-soft border border-gold/30 whitespace-nowrap backdrop-blur-sm">
                {n.label}
              </span>
              {n.note && (
                <span className="absolute left-1/2 top-full mt-7 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 px-2 py-1 rounded bg-ink-elevated border border-ink-border text-[10px] text-mist whitespace-nowrap shadow-lg">
                  {n.note}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 pb-3 space-y-2">
        <p className="text-sm text-mist leading-relaxed">{keyframe.tip}</p>
        {nodes.length > 0 && (
          <ul className="grid grid-cols-2 gap-1.5">
            {nodes.map((n, i) => (
              <li
                key={n.id}
                className="flex items-start gap-1.5 text-[11px] text-paper-dim bg-ink-soft/60 rounded-md px-2 py-1.5 border border-ink-border/60"
              >
                <span className="w-4 h-4 rounded-full bg-vermillion/80 text-white text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>
                  <span className="text-gold-soft">{n.label}</span>
                  {n.note ? <span className="text-mist"> · {n.note}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
