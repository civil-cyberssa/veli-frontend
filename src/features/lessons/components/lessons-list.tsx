'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  Sparkles,
  Star,
} from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface LessonsListProps {
  lessons: LessonProgress[]
  currentLessonId: number
  onExerciseOpen?: (lesson: LessonProgress) => void
}

type TimelineItemType = 'lesson' | 'exercise' | 'quiz'

interface TimelineItem {
  id: string
  type: TimelineItemType
  lesson: LessonProgress
  status: 'done' | 'active' | 'pending'
}

export function LessonsList({ lessons, currentLessonId, onExerciseOpen }: LessonsListProps) {
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

  const sortedLessons = [...lessons].sort((a, b) =>
    new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime()
  )

  const timelineItems = sortedLessons.flatMap((lesson) => {
    const isCurrentLesson = lesson.lesson_id === currentLessonId
    const baseStatus: TimelineItem['status'] = lesson.watched
      ? 'done'
      : isCurrentLesson
        ? 'active'
        : 'pending'

    const items: TimelineItem[] = [
      {
        id: `lesson-${lesson.lesson_id}`,
        type: 'lesson',
        lesson,
        status: baseStatus,
      },
    ]

    if (lesson.exercise) {
      const { answers_count, questions_count } = lesson.exercise
      const exerciseStatus: TimelineItem['status'] =
        questions_count > 0 && answers_count === questions_count
          ? 'done'
          : isCurrentLesson || answers_count > 0
            ? 'active'
            : 'pending'

      items.push({
        id: `exercise-${lesson.lesson_id}`,
        type: 'exercise',
        lesson,
        status: exerciseStatus,
      })
    }

    items.push({
      id: `quiz-${lesson.lesson_id}`,
      type: 'quiz',
      lesson,
      status: lesson.exercise_score !== null ? 'done' : isCurrentLesson ? 'active' : 'pending',
    })

    return items
  })

  const completedLessons = lessons.filter((l) => l.watched).length

  return (
    <aside className="lg:sticky lg:top-8">
      <Card className="overflow-hidden border-border/60 bg-background/95 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conteúdo</p>
            <h2 className="text-lg font-bold leading-tight">Cronograma</h2>
          </div>
          <Badge variant="outline" className="text-[11px] font-semibold">
            {completedLessons}/{lessons.length} aulas
          </Badge>
        </div>

        <Separator className="my-4" />

        <TooltipProvider delayDuration={0}>
          <div className="space-y-3">
            {timelineItems.map((item, index) => {
              const isLesson = item.type === 'lesson'
              const isExercise = item.type === 'exercise'
              const isQuiz = item.type === 'quiz'
              const isCurrentLesson = item.lesson.lesson_id === currentLessonId
              const { exercise } = item.lesson

              const answeredText = exercise
                ? `${exercise.answers_count}/${exercise.questions_count} questões`
                : null

              const statusClasses = {
                done: 'border-green-500 text-green-500',
                active: 'border-primary text-primary',
                pending: 'border-border text-muted-foreground',
              }[item.status]

              const icon = isLesson ? (
                item.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )
              ) : isExercise ? (
                <ClipboardList className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )

              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`rounded-lg border bg-background/80 px-3 py-3 ${
                    isCurrentLesson ? 'ring-1 ring-primary/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border ${statusClasses}`}
                    >
                      {icon}
                    </span>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <span className="rounded-full bg-muted px-2 py-1 text-foreground">
                          {isLesson ? 'Aula' : isExercise ? 'Exercício' : 'Quiz'}
                        </span>
                        <span>
                          {new Date(item.lesson.scheduled_datetime).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <Link
                            href={`/aulas/${item.lesson.lesson_id}`}
                            className={`block text-sm font-semibold leading-tight hover:text-primary ${
                              isCurrentLesson ? 'text-primary' : ''
                            }`}
                          >
                            {isLesson ? item.lesson.lesson_name : `${item.lesson.lesson_name} · ${isExercise ? 'Exercício' : 'Quiz'}`}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.lesson.rating && isLesson && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {item.lesson.rating}/5
                              </span>
                            )}
                            {isExercise && answeredText && (
                              <Badge variant="outline" className="h-5 px-2 text-[11px]">
                                {answeredText}
                              </Badge>
                            )}
                            {isQuiz && (
                              <span className="text-[11px] text-muted-foreground">
                                {item.lesson.exercise_score !== null
                                  ? `Nota: ${item.lesson.exercise_score}`
                                  : 'Aguardando tentativa'}
                              </span>
                            )}
                          </div>
                        </div>

                        {isExercise && exercise && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={isCurrentLesson ? 'default' : 'outline'}
                                onClick={() => onExerciseOpen?.(item.lesson)}
                                disabled={!onExerciseOpen}
                                className="font-semibold"
                              >
                                Responder
                              </Button>
                            </TooltipTrigger>
                            {!onExerciseOpen && (
                              <TooltipContent side="left" className="text-xs">
                                Exercício bloqueado até selecionar uma matrícula.
                              </TooltipContent>
                            )}
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </TooltipProvider>
      </Card>
    </aside>
  )
}
