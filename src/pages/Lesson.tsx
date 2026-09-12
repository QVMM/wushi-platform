import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { formatTime, getStage, type Lesson as LessonType } from '../data/lessons'
import { useProgress } from '../context/ProgressContext'
import { VideoPlayer } from '../components/VideoPlayer'
import { SkeletonPanel } from '../components/SkeletonPanel'
import { SealBadge } from '../components/SealBadge'
import { GoldRule } from '../components/GoldRule'

type TipTab = 'essentials' | 'mistakes' | 'mnemonic' | 'safety'

export function Lesson() {
  const { lessonId } = useParams()
  const { lessons, checklistDone, toggleChecklist, markComplete, setLessonProgress } = useProgress()
  const lesson = lessons.find((l) => l.id === lessonId) ?? null

  const [time, setTime] = useState(0)
  const [skeletonOn, setSkeletonOn] = useState(false)
  const [selectedKf, setSelectedKf] = useState<string | null>(null)
  const [tipTab, setTipTab] = useState<TipTab>('essentials')

  const activeKf = useMemo(() => {
    if (!lesson) return null
    if (selectedKf) {
      const found = lesson.keyframes.find((k) => k.id === selectedKf)
      if (found) return found
    }
    let best = lesson.keyframes[0] ?? null
    for (const kf of lesson.keyframes) {
      if (kf.time <= time + 0.5) best = kf
    }
    return best
  }, [lesson, selectedKf, time])

  const phase = lesson && lesson.durationSec > 0 ? time / lesson.durationSec : 0
  const doneSet = lesson ? (checklistDone[lesson.id] ?? new Set<string>()) : new Set<string>()

  if (!lesson) return <Navigate to="/" replace />
  if (lesson.locked) return <Navigate to={`/stage/${lesson.stageId}`} replace />

  const stage = getStage(lesson.stageId)

  const tipTabs: { id: TipTab; label: string }[] = [
    { id: 'essentials', label: '要领' },
    { id: 'mistakes', label: '易错' },
    { id: 'mnemonic', label: '口诀' },
    { id: 'safety', label: '安全' },
  ]

  const handleTime = (t: number) => {
    setTime(t)
    if (lesson.durationSec > 0) {
      const pct = Math.min(99, Math.round((t / lesson.durationSec) * 100))
      if (pct > (lesson.progress ?? 0) && !lesson.completed) {
        setLessonProgress(lesson.id, pct)
      }
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-mist">
        <Link to="/" className="hover:text-gold transition-colors">首页</Link>
        <span>/</span>
        <Link to={`/stage/${stage.id}`} className="hover:text-gold transition-colors">{stage.name}</Link>
        <span>/</span>
        <span className="text-paper-dim">{lesson.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SealBadge text={stage.seal} size="sm" />
            <span className="text-xs text-mist">{stage.name} · 课时 {lesson.order}</span>
            <span className="text-xs text-gold-dim tabular-nums">{lesson.duration}</span>
          </div>
          <h1 className="font-serif text-2xl lg:text-3xl text-paper">{lesson.title}</h1>
          <p className="text-sm text-mist">{lesson.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {lesson.tags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border border-ink-border text-mist">
              {t}
            </span>
          ))}
        </div>
      </div>

      <GoldRule />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <VideoPlayer
            poster={lesson.poster}
            videoUrl={lesson.videoUrl}
            durationSec={lesson.durationSec}
            keyframes={lesson.keyframes}
            currentTime={time}
            onTimeChange={handleTime}
            skeletonOn={skeletonOn}
            onSkeletonToggle={() => setSkeletonOn((v) => !v)}
            selectedKeyframeId={selectedKf ?? activeKf?.id ?? null}
            onSelectKeyframe={(id) => setSelectedKf(id)}
          />

          {activeKf && (
            <div className="rounded-xl border border-ink-border bg-ink-elevated p-4 flex gap-4 items-start">
              <img src={activeKf.image} alt="" className="w-20 h-14 rounded-md object-cover shrink-0 border border-ink-border" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] tabular-nums text-gold">{formatTime(activeKf.time)}</span>
                  <span className="font-serif text-paper">{activeKf.label}</span>
                </div>
                <p className="text-sm text-mist leading-relaxed">{activeKf.tip}</p>
              </div>
            </div>
          )}

          <section className="rounded-xl border border-ink-border bg-ink-elevated p-5">
            <h2 className="font-serif text-lg text-paper mb-4">动作拆解时间轴</h2>
            <div className="relative">
              <div className="absolute left-0 right-0 top-3 h-px bg-ink-border" />
              <div className="flex justify-between gap-2 relative">
                {lesson.keyframes.map((kf) => {
                  const active = activeKf?.id === kf.id
                  return (
                    <button
                      key={kf.id}
                      type="button"
                      onClick={() => {
                        setTime(kf.time)
                        setSelectedKf(kf.id)
                      }}
                      className="flex flex-col items-center gap-2 flex-1 min-w-0 group"
                      style={{ maxWidth: `${100 / lesson.keyframes.length}%` }}
                    >
                      <span
                        className={`w-3 h-3 rounded-full border-2 z-10 transition-all ${
                          active
                            ? 'bg-vermillion border-vermillion scale-125 shadow-[0_0_10px_rgba(194,58,43,0.5)]'
                            : 'bg-ink border-gold/60 group-hover:border-gold'
                        }`}
                      />
                      <img
                        src={kf.image}
                        alt=""
                        className={`w-full aspect-video rounded object-cover border transition-all ${
                          active ? 'border-vermillion/60 ring-1 ring-vermillion/30' : 'border-ink-border opacity-70 group-hover:opacity-100'
                        }`}
                      />
                      <span className={`text-[10px] tabular-nums ${active ? 'text-gold' : 'text-mist'}`}>
                        {formatTime(kf.time)}
                      </span>
                      <span className={`text-[11px] text-center leading-tight ${active ? 'text-paper' : 'text-mist'}`}>
                        {kf.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <SkeletonPanel active={skeletonOn} phase={phase} className="h-64" />

          <section className="rounded-xl border border-ink-border bg-ink-elevated overflow-hidden">
            <div className="flex border-b border-ink-border">
              {tipTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipTab(t.id)}
                  className={`flex-1 py-2.5 text-xs transition-colors ${
                    tipTab === t.id
                      ? 'text-gold-soft bg-ink-soft border-b-2 border-gold'
                      : 'text-mist hover:text-paper'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-4 min-h-[140px]">
              {tipTab === 'mnemonic' ? (
                <p className="font-serif text-base text-gold-soft leading-relaxed text-center py-4">
                  「{lesson.mnemonic}」
                </p>
              ) : (
                <ul className="space-y-2">
                  {(tipTab === 'essentials'
                    ? lesson.essentials
                    : tipTab === 'mistakes'
                      ? lesson.mistakes
                      : lesson.safety
                  ).map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-mist">
                      <span
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                          tipTab === 'mistakes' ? 'bg-vermillion' : tipTab === 'safety' ? 'bg-gold' : 'bg-gold-dim'
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-ink-border bg-ink-elevated p-4">
            <h2 className="font-serif text-base text-paper mb-3">考核标准</h2>
            <ul className="space-y-2.5">
              {lesson.checklist.map((item) => {
                const checked = doneSet.has(item.id)
                return (
                  <li key={item.id}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChecklist(lesson.id, item.id)}
                        className="mt-1 accent-vermillion"
                      />
                      <span
                        className={`text-sm flex-1 ${
                          checked ? 'text-paper-dim line-through' : 'text-mist group-hover:text-paper'
                        }`}
                      >
                        {item.text}
                      </span>
                      <span className="text-[10px] tabular-nums text-gold-dim">{item.weight}%</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              onClick={() => markComplete(lesson.id)}
              className="mt-4 w-full py-2.5 rounded-md border border-gold/40 text-sm text-gold-soft hover:bg-gold/10 transition-colors"
            >
              标记本课完成
            </button>
          </section>
        </div>
      </div>

      <section className="rounded-xl border border-ink-border bg-ink-soft/50 p-5">
        <h2 className="font-serif text-base text-paper mb-2">课时概述</h2>
        <p className="text-sm text-mist leading-relaxed">{lesson.summary}</p>
      </section>

      <NavAdjacent lesson={lesson} all={lessons} />
    </div>
  )
}

function NavAdjacent({ lesson, all }: { lesson: LessonType; all: LessonType[] }) {
  const stageLessons = all
    .filter((l) => l.stageId === lesson.stageId && !l.locked)
    .sort((a, b) => a.order - b.order)
  const idx = stageLessons.findIndex((l) => l.id === lesson.id)
  const prev = idx > 0 ? stageLessons[idx - 1] : null
  const next = idx < stageLessons.length - 1 ? stageLessons[idx + 1] : null

  return (
    <div className="flex justify-between gap-4 pt-2">
      {prev ? (
        <Link to={`/lesson/${prev.id}`} className="text-sm text-mist hover:text-gold transition-colors">
          ← {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={`/lesson/${next.id}`} className="text-sm text-mist hover:text-gold transition-colors">
          {next.title} →
        </Link>
      ) : (
        <Link to={`/stage/${lesson.stageId}`} className="text-sm text-mist hover:text-gold transition-colors">
          返回阶段列表 →
        </Link>
      )}
    </div>
  )
}
