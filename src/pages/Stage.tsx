import { Link, useParams, Navigate } from 'react-router-dom'
import { getStage, type StageId } from '../data/lessons'
import { SealBadge } from '../components/SealBadge'
import { ProgressBar } from '../components/ProgressBar'
import { GoldRule } from '../components/GoldRule'
import { useProgress } from '../context/ProgressContext'

const valid: StageId[] = ['beginner', 'intermediate', 'advanced', 'concept']

export function Stage() {
  const { stageId } = useParams()
  const { lessons: all } = useProgress()
  if (!stageId || !valid.includes(stageId as StageId)) return <Navigate to="/path" replace />

  const stage = getStage(stageId as StageId)
  const list = all.filter((l) => l.stageId === stage.id).sort((a, b) => a.order - b.order)

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
        <div className="relative w-full lg:w-96 aspect-video rounded-xl overflow-hidden border border-ink-border shrink-0">
          <img src={stage.cover} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <SealBadge text={stage.seal} size="lg" />
          </div>
        </div>
        <div className="flex-1 space-y-3 pb-1">
          <Link to="/path" className="text-xs text-mist hover:text-gold transition-colors">← 返回阶段路径</Link>
          <h1 className="font-serif text-3xl text-paper">{stage.name}阶段</h1>
          <p className="text-mist text-sm max-w-xl">{stage.description}</p>
          <GoldRule className="w-20" />
          <div className="flex flex-wrap gap-2 pt-1">
            {stage.focus.map((f) => (
              <span key={f} className="text-xs px-2.5 py-1 rounded-full border border-gold/30 text-gold-soft bg-gold/5">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-lg text-paper mb-4">课时列表</h2>
        <div className="space-y-3">
          {list.map((lesson) => (
            <div
              key={lesson.id}
              className={`flex flex-col sm:flex-row gap-4 rounded-xl border p-3 sm:p-4 transition-colors ${
                lesson.locked
                  ? 'border-ink-border/50 bg-ink-elevated/40 opacity-60'
                  : 'border-ink-border bg-ink-elevated hover:border-gold/35'
              }`}
            >
              <div className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden shrink-0">
                <img src={lesson.cover} alt="" className="w-full h-full object-cover" />
                {lesson.locked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs text-paper">锁定</div>
                )}
                {lesson.completed && (
                  <div className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-vermillion/90 text-white">已完成</div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] tabular-nums text-gold-dim">0{lesson.order}</span>
                  <h3 className="font-serif text-lg text-paper truncate">{lesson.title}</h3>
                </div>
                <p className="text-xs text-mist">{lesson.subtitle} · {lesson.duration}</p>
                <p className="text-sm text-mist/90 line-clamp-1">{lesson.summary}</p>
                <ProgressBar value={lesson.progress ?? 0} showLabel className="max-w-xs" />
              </div>
              <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                {lesson.locked ? (
                  <span className="text-xs text-mist px-3 py-2">需解锁高级</span>
                ) : (
                  <Link
                    to={`/lesson/${lesson.id}`}
                    className="px-4 py-2 rounded-md bg-vermillion hover:bg-vermillion-soft text-white text-sm transition-colors"
                  >
                    {(lesson.progress ?? 0) > 0 ? '继续' : '开始'}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
