'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { PlayCircle, MonitorPlay, ChevronDown } from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface LessonsListProps {
  lessons: LessonProgress[]
  currentLessonId: number | null
  compact?: boolean
  onSelectLesson?: (lessonId: number) => void
}

// Função auxiliar para formatar duração (mock por enquanto)
const formatDuration = (index: number) => {
  // Mock de durações - substituir com dados reais quando disponível
  const mockDurations = ['01:53:55', '01:55:10', '01:57:51', '01:59:29', '02:01:15']
  return mockDurations[index % mockDurations.length] || '01:00:00'
}

// Calcular duração total (mock)
const getTotalDuration = (lessons: LessonProgress[]) => {
  // Mock - substituir com cálculo real
  if (!lessons.length) return '00:00'
  return '07:46:25'
}

export function LessonsList({ lessons, currentLessonId, compact = false, onSelectLesson }: LessonsListProps) {
  const modules = useMemo(
    () =>
      lessons.reduce(
        (groups, lesson) => {
          const existing = groups.find((group) => group.moduleId === lesson.module_id)

          if (existing) {
            existing.lessons.push(lesson)
            return groups
          }

          return [
            ...groups,
            {
              moduleId: lesson.module_id,
              moduleName: lesson.module_name,
              lessons: [lesson],
            },
          ]
        },
        [] as { moduleId: number; moduleName: string; lessons: LessonProgress[] }[]
      ),
    [lessons]
  )

  const [openModuleId, setOpenModuleId] = useState<number | null>(null)

  useEffect(() => {
    if (modules.length === 0) return

    const moduleWithCurrent = currentLessonId
      ? modules.find((module) =>
          module.lessons.some((lesson) => lesson.lesson_id === currentLessonId)
        )
      : null

    if (moduleWithCurrent) {
      setOpenModuleId(moduleWithCurrent.moduleId)
      return
    }

    if (openModuleId === null) {
      setOpenModuleId(modules[0].moduleId)
    }
  }, [modules, currentLessonId, openModuleId])

  if (!lessons || lessons.length === 0) {
    return (
      <Card className="p-6 border-border/50">
        <div className="text-center space-y-2">
          <PlayCircle className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">Nenhuma aula disponível</p>
        </div>
      </Card>
    )
  }

  const handleLessonSelect = (lessonId: number) => {
    onSelectLesson?.(lessonId)
  }

  const renderModules = (
    <div className="space-y-3">
      {modules.map((moduleGroup, moduleIndex) => {
        const isOpen = openModuleId === moduleGroup.moduleId

        return (
          <Collapsible
            key={moduleGroup.moduleId}
            open={isOpen}
            onOpenChange={(open) => setOpenModuleId(open ? moduleGroup.moduleId : null)}
            className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur"
          >
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:border-primary/40 hover:bg-muted/40">
                <div className="h-10 w-10 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center text-sm">
                  {moduleIndex + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight text-foreground">
                    {moduleGroup.moduleName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {moduleGroup.lessons.length} {moduleGroup.lessons.length === 1 ? 'aula' : 'aulas'} • {getTotalDuration(moduleGroup.lessons)}
                  </p>
                </div>

                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isOpen ? 'rotate-180' : ''
                  )}
                />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="px-3 pb-3 pt-1 space-y-1">
              {moduleGroup.lessons.map((lesson, index) => {
                const isCurrentLesson = lesson.lesson_id === currentLessonId

                return (
                  <button
                    key={lesson.lesson_id}
                    type="button"
                    onClick={() => handleLessonSelect(lesson.lesson_id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
                      isCurrentLesson
                        ? 'border-primary/70 bg-primary/10 ring-1 ring-primary/20'
                        : 'border-border/50 bg-background/60 hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    <div className="p-2 rounded-lg bg-muted/60 text-muted-foreground shadow-sm">
                      <MonitorPlay className={cn('h-4 w-4', isCurrentLesson && 'text-primary')} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-tight text-foreground line-clamp-2', isCurrentLesson && 'font-semibold')}>
                        {lesson.lesson_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80">{formatDuration(index)}</p>
                    </div>

                    {lesson.watched && (
                      <span className="text-[11px] font-medium text-primary">Assistida</span>
                    )}
                  </button>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )

  if (compact) {
    return renderModules
  }

  return (
    <Card className="border-border/60 bg-background/80 p-3 shadow-sm">
      {renderModules}
    </Card>
  )
}
