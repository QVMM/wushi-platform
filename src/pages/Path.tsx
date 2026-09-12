import { Link } from 'react-router-dom'
import { stages, getLessonsByStage } from '../data/lessons'
import { SealBadge } from '../components/SealBadge'
import { ProgressBar } from '../components/ProgressBar'
import { GoldRule } from '../components/GoldRule'

export function Path() {
  return (
    <div className="animate-fade-up max-w-4xl mx-auto">
      <div className="mb-10 text-center space-y-3">
        <SealBadge text="径" size="md" className="mx-auto" />
        <h1 className="font-serif text-3xl text-paper">阶段路径</h1>
        <p className="text-mist text-sm max-w-md mx-auto">初 → 中 → 高，循序解锁。场景教学可随时进入，作为方法补充。</p>
        <GoldRule className="w-24 mx-auto" />
      </div>

      <div className="relative space-y-0">
        {/* vertical line */}
        <div className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-gold via-vermillion to-ink-border" />

        {stages.map((stage, idx) => {
          const list = getLessonsByStage(stage.id)
          const avg = list.length
            ? Math.round(list.reduce((a, l) => a + (l.progress ?? 0), 0) / list.length)
            : 0
          return (
            <div key={stage.id} className="relative flex gap-6 pb-10 last:pb-0">
              <div
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 ${
                  stage.unlocked
                    ? 'border-gold bg-ink shadow-[0_0_20px_rgba(198,161,91,0.25)]'
                    : 'border-ink-border bg-ink-elevated'
                }`}
              >
                <span className={`font-serif text-xl ${stage.unlocked ? 'text-gold' : 'text-mist'}`}>
                  {stage.seal}
                </span>
              </div>

              <div
                className={`flex-1 rounded-xl border overflow-hidden transition-colors ${
                  stage.unlocked ? 'border-ink-border bg-ink-elevated hover:border-gold/35' : 'border-ink-border/50 bg-ink-elevated/40'
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 aspect-video md:aspect-auto relative shrink-0">
                    <img
                      src={stage.cover}
                      alt=""
                      className={`w-full h-full object-cover ${!stage.unlocked ? 'grayscale opacity-50' : ''}`}
                    />
                    {!stage.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-xs px-2 py-1 rounded border border-mist/40 text-paper">未解锁</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl text-paper">{stage.name}</h2>
                      <span className="text-[11px] text-mist tracking-wider">{stage.nameEn}</span>
                      <span className="text-[11px] text-mist ml-auto">阶段 {idx + 1}</span>
                    </div>
                    <p className="text-sm text-mist">{stage.description}</p>
                    {!stage.unlocked && stage.requirement && (
                      <p className="text-xs text-vermillion-soft">解锁条件：{stage.requirement}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {stage.focus.map((f) => (
                        <span key={f} className="text-[11px] px-2 py-0.5 rounded-full border border-ink-border text-mist">
                          {f}
                        </span>
                      ))}
                    </div>
                    <ProgressBar value={avg} showLabel />
                    <div className="pt-1">
                      {stage.unlocked ? (
                        <Link
                          to={`/stage/${stage.id}`}
                          className="inline-flex text-sm text-gold hover:text-gold-soft transition-colors"
                        >
                          进入阶段详情 →
                        </Link>
                      ) : (
                        <span className="text-sm text-mist/60">完成前置阶段后开放</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
