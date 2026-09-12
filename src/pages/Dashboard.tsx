import { Link } from 'react-router-dom'
import { getContinueLesson, stages, getLessonsByStage } from '../data/lessons'
import {
  IMG_CLASSROOM_STILL001,
  IMG_DSC00056,
  IMG_DSC00065,
  IMG_DSC00067,
  IMG_DSC00068,
} from '../data/media'
import { useProgress } from '../context/ProgressContext'
import { ProgressBar } from '../components/ProgressBar'
import { SealBadge } from '../components/SealBadge'
import { LogoMark } from '../components/LogoMark'
import { GoldRule } from '../components/GoldRule'

export function Dashboard() {
  const { lessons } = useProgress()
  const cont = (() => {
    const inProgress = lessons.find((l) => !l.locked && (l.progress ?? 0) > 0 && (l.progress ?? 0) < 100)
    if (inProgress) return inProgress
    return lessons.find((l) => !l.locked && !l.completed && (l.progress ?? 0) === 0) ?? getContinueLesson()
  })()
  const progress = (() => {
    const unlocked = lessons.filter((l) => !l.locked)
    if (!unlocked.length) return 0
    return Math.round(unlocked.reduce((a, l) => a + (l.progress ?? 0), 0) / unlocked.length)
  })()

  return (
    <div className="animate-fade-up space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-ink-border bg-ink-elevated">
        <div className="absolute inset-0">
          <img src={IMG_CLASSROOM_STILL001} alt="" className="w-full h-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        </div>
        <div className="relative px-8 lg:px-12 py-12 lg:py-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-3">
              <LogoMark size={44} className="shadow-md shadow-vermillion/25" />
              <span className="text-xs tracking-[0.2em] text-gold uppercase">Southern Lion · Staged Curriculum</span>
            </div>
            <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-paper leading-snug">
              狮舞阶段式<br />标准化教学平台
            </h1>
            <p className="text-mist text-sm lg:text-[15px] leading-relaxed">
              从线框狮头到高桩展演，以动作拆解、骨架分析与考核标准，构建可复用的南狮教练实验室。
            </p>
            <GoldRule className="w-32" />
          </div>
          <div className="bg-ink/70 backdrop-blur-sm border border-ink-border rounded-xl p-5 min-w-[220px]">
            <div className="text-xs text-mist mb-2">总体学习进度</div>
            <div className="font-serif text-3xl text-gold-soft mb-3 tabular-nums">{progress}%</div>
            <ProgressBar value={progress} />
            <div className="mt-3 text-[11px] text-mist">基于已解锁课时加权估算</div>
          </div>
        </div>
      </section>

      {/* Continue */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-xl text-paper">继续学习</h2>
          <Link to="/path" className="text-sm text-gold hover:text-gold-soft transition-colors">查看阶段路径 →</Link>
        </div>
        <Link
          to={`/lesson/${cont.id}`}
          className="group flex flex-col sm:flex-row overflow-hidden rounded-xl border border-ink-border bg-ink-elevated hover:border-gold/40 transition-colors"
        >
          <div className="sm:w-72 lg:w-80 aspect-video sm:aspect-auto relative shrink-0 overflow-hidden">
            <img src={cont.cover} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent sm:bg-gradient-to-r" />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center gap-3">
            <div className="flex items-center gap-2 text-xs text-mist">
              <span className="seal-stamp px-1.5 py-0.5 text-[10px] rounded-sm">{stages.find(s => s.id === cont.stageId)?.seal}</span>
              <span>{stages.find(s => s.id === cont.stageId)?.name}</span>
              <span>·</span>
              <span>{cont.duration}</span>
            </div>
            <h3 className="font-serif text-xl text-paper group-hover:text-gold-soft transition-colors">{cont.title}</h3>
            <p className="text-sm text-mist line-clamp-2">{cont.summary}</p>
            <ProgressBar value={cont.progress ?? 0} showLabel className="max-w-xs mt-1" />
          </div>
        </Link>
      </section>

      {/* Stage overview */}
      <section>
        <h2 className="font-serif text-xl text-paper mb-4">阶段总览</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stages.map((stage) => {
            const list = getLessonsByStage(stage.id)
            const done = list.filter((l) => l.completed || (l.progress ?? 0) >= 100).length
            const avg = list.length
              ? Math.round(list.reduce((a, l) => a + (l.progress ?? 0), 0) / list.length)
              : 0
            return (
              <Link
                key={stage.id}
                to={stage.unlocked ? `/stage/${stage.id}` : '/path'}
                className={`relative rounded-xl border p-5 transition-all ${
                  stage.unlocked
                    ? 'border-ink-border bg-ink-elevated hover:border-gold/40 hover:-translate-y-0.5'
                    : 'border-ink-border/60 bg-ink-elevated/50 opacity-70'
                }`}
              >
                {!stage.unlocked && (
                  <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded bg-ink border border-ink-border text-mist">
                    锁定
                  </div>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <SealBadge text={stage.seal} size="sm" />
                  <div>
                    <div className="font-serif text-lg text-paper">{stage.name}</div>
                    <div className="text-[11px] text-mist tracking-wider">{stage.nameEn}</div>
                  </div>
                </div>
                <p className="text-xs text-mist leading-relaxed mb-4 line-clamp-2">{stage.description}</p>
                <div className="flex items-center justify-between text-xs text-mist mb-2">
                  <span>{done}/{list.length} 课时</span>
                  <span className="tabular-nums text-gold-dim">{avg}%</span>
                </div>
                <ProgressBar value={avg} />
              </Link>
            )
          })}
        </div>
      </section>

      {/* Atmosphere strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[IMG_DSC00056, IMG_DSC00065, IMG_DSC00067, IMG_DSC00068].map((src, i) => (
          <div key={src} className="aspect-[4/3] rounded-lg overflow-hidden border border-ink-border opacity-80 hover:opacity-100 transition-opacity">
            <img src={src} alt={`社团氛围 ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </section>
    </div>
  )
}
