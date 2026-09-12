import type { Keyframe } from '../data/lessons'
import type { Landmark } from '../lib/pose'
import { KeyframeNodeCard } from './KeyframeNodeCard'
import { SkeletonPanel } from './SkeletonPanel'

interface Props {
  keyframe: Keyframe | null
  landmarks?: Landmark[] | null
  visible?: boolean
  className?: string
}

/** Combined right-panel teaching card: keyframe still + labeled schematic */
export function ActionAnalysisCard({
  keyframe,
  landmarks,
  visible = true,
  className = '',
}: Props) {
  if (!visible) {
    return (
      <div
        className={`rounded-xl border border-ink-border bg-ink-elevated p-6 text-center text-sm text-mist ${className}`}
      >
        <div className="font-serif text-gold-dim mb-1">动作解析</div>
        <p>开启「节点分析」以查看关键帧标注与示意分析</p>
      </div>
    )
  }

  return (
    <section className={`rounded-xl border border-ink-border bg-ink-elevated overflow-hidden ${className}`}>
      <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-ink-border/70">
        <span className="text-[11px] text-gold-dim font-serif tracking-wider">动作解析</span>
        <span className="text-[10px] text-mist">关键帧标注 · 示意分析</span>
      </div>

      <div className="p-3 space-y-3">
        <KeyframeNodeCard keyframe={keyframe} visible embedded />

        <SkeletonPanel
          active
          landmarks={landmarks}
          keyframeLabel={keyframe?.label}
          showLegend
          className="min-h-[360px] h-[24rem] !rounded-lg"
        />
      </div>
    </section>
  )
}
