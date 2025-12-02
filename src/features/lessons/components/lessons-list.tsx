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
    <Card className="border-border/50 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Cronograma</h2>
            <p className="text-xs text-muted-foreground">Aulas, exercícios e quizzes alinhados à direita como na Rocketseat.</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {completedLessons}/{lessons.length} aulas concluídas
          </Badge>
        </div>

        <Separator />

        <TooltipProvider delayDuration={0}>
          <div className="relative space-y-4 pl-2">
            <div className="absolute left-[13px] top-2 bottom-4 w-[2px] bg-gradient-to-b from-primary/50 via-border/70 to-transparent" />

            {timelineItems.map((item, index) => {
              const isLesson = item.type === 'lesson'
              const isExercise = item.type === 'exercise'
              const isQuiz = item.type === 'quiz'
              const isCurrentLesson = item.lesson.lesson_id === currentLessonId
              const exercise = item.lesson.exercise
              const answeredText = exercise
                ? `${exercise.answers_count}/${exercise.questions_count} questões`
                : null

              const statusClasses = {
                done: 'bg-green-500 shadow-[0_0_0_3px] shadow-green-500/20 text-white',
                active: 'bg-primary shadow-[0_0_0_3px] shadow-primary/20 text-white',
                pending: 'bg-muted text-muted-foreground',
              }[item.status]

              const badgeVariant = item.status === 'done'
                ? 'outline'
                : item.status === 'active'
                  ? 'default'
                  : 'secondary'

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
                <div key={`${item.id}-${index}`} className="relative pl-6">
                  <span
                    className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full ${statusClasses}`}
                  >
                    {icon}
                  </span>

                  <div
                    className={`rounded-xl border transition-all ${
                      isCurrentLesson
                        ? 'border-primary/60 bg-primary/5 shadow-md'
                        : 'border-border/50 bg-background'
                    }`}
                  >
                    <div className="flex flex-col gap-2 px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <Badge variant={badgeVariant} className="text-[10px] uppercase">
                          {isLesson ? 'Aula' : isExercise ? 'Exercício' : 'Quiz & feedback'}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
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
                            className={`block text-sm font-semibold leading-tight transition-colors hover:text-primary ${
                              isCurrentLesson ? 'text-primary' : ''
                            }`}
                          >
                            {isLesson ? item.lesson.lesson_name : `${item.lesson.lesson_name} · ${isExercise ? 'Exercício' : 'Quiz'}`}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {item.lesson.rating && isLesson && (
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
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

        <div className="pt-3 text-center text-[11px] text-muted-foreground">
          Próximas etapas organizadas no fluxo: Aula → Exercício → Quiz → Aula seguinte.
        </div>
      </div>
    </Card>
  )
}
