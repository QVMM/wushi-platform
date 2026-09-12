import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { lessons as initialLessons, type Lesson } from '../data/lessons'

interface ProgressContextValue {
  lessons: Lesson[]
  checklistDone: Record<string, Set<string>>
  toggleChecklist: (lessonId: string, itemId: string) => void
  setLessonProgress: (lessonId: string, progress: number) => void
  markComplete: (lessonId: string) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [lessons, setLessons] = useState(initialLessons)
  const [checklistDone, setChecklistDone] = useState<Record<string, Set<string>>>({})

  const value = useMemo<ProgressContextValue>(
    () => ({
      lessons,
      checklistDone,
      toggleChecklist: (lessonId, itemId) => {
        setChecklistDone((prev) => {
          const next = { ...prev }
          const set = new Set(prev[lessonId] ?? [])
          if (set.has(itemId)) set.delete(itemId)
          else set.add(itemId)
          next[lessonId] = set
          return next
        })
      },
      setLessonProgress: (lessonId, progress) => {
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, progress, completed: progress >= 100 } : l)),
        )
      },
      markComplete: (lessonId) => {
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, progress: 100, completed: true } : l)),
        )
      },
    }),
    [lessons, checklistDone],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
