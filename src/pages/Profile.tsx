import { Link } from 'react-router-dom'
import { stages } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { ProgressBar } from '../components/ProgressBar'
import { SealBadge } from '../components/SealBadge'
import { GoldRule } from '../components/GoldRule'

export function Profile() {
  const { lessons } = useProgress()
  const completed = lessons.filter((l) => l.completed || (l.progress ?? 0) >= 100).length
  const inProg = lessons.filter((l) => !l.locked && (l.progress ?? 0) > 0 && (l.progress ?? 0) < 100).length
  const unlocked = lessons.filter((l) => !l.locked)
  const overall = unlocked.length
    ? Math.round(unlocked.reduce((a, l) => a + (l.progress ?? 0), 0) / unlocked.length)
    : 0

  return (
    <div className="animate-fade-up max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-5 rounded-2xl border border-ink-border bg-ink-elevated p-6">
        <div className="w-16 h-16 rounded-full border-2 border-gold/50 bg-ink flex items-center justify-center">
          <SealBadge text="习" size="md" className="rotate-0" />
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-2xl text-paper">学员 · 演示账号</h1>
          <p className="text-sm text-mist mt-1">无登录态 · 本地进度 mock</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="font-serif text-3xl text-gold-soft tabular-nums">{overall}%</div>
          <div className="text-[11px] text-mist">综合进度</div>
        </div>
      </div>

      <GoldRule />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '已完成', value: completed },
          { label: '进行中', value: inProg },
          { label: '已解锁', value: unlocked.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-ink-border bg-ink-elevated p-4 text-center">
            <div className="font-serif text-2xl text-paper tabular-nums">{s.value}</div>
            <div className="text-xs text-mist mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-paper">分阶段进度</h2>
        {stages.map((stage) => {
          const list = lessons.filter((l) => l.stageId === stage.id)
          const avg = list.length
            ? Math.round(list.reduce((a, l) => a + (l.progress ?? 0), 0) / list.length)
            : 0
          return (
            <div key={stage.id} className="rounded-xl border border-ink-border bg-ink-elevated p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SealBadge text={stage.seal} size="sm" />
                  <span className="font-serif text-paper">{stage.name}</span>
                  {!stage.unlocked && <span className="text-[10px] text-mist">锁定</span>}
                </div>
                <span className="text-xs tabular-nums text-gold-dim">{avg}%</span>
              </div>
              <ProgressBar value={avg} />
            </div>
          )
        })}
      </section>

      <div className="text-center">
        <Link to="/path" className="text-sm text-gold hover:text-gold-soft transition-colors">
          前往阶段路径继续学习 →
        </Link>
      </div>
    </div>
  )
}
