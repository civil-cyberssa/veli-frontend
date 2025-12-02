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
  Video,
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
      <Card className="overflow-hidden border-border/60 bg-gradient-to-b from-background via-background/70 to-background/90 p-4 shadow-xl shadow-primary/5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Conteúdo</p>
            <h2 className="text-xl font-bold leading-tight">Sua trilha nesta aula</h2>
            <p className="text-xs text-muted-foreground">
              Acompanhe a ordem Aula → Exercício → Quiz com o visual inspirado na Rocketseat.
            </p>
          </div>
          <Badge variant="secondary" className="border border-primary/20 bg-primary/10 text-[11px] font-semibold text-primary">
            {completedLessons}/{lessons.length} aulas
          </Badge>
        </div>

        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Video className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-foreground/80">Imersão guiada</p>
              <p className="text-muted-foreground">
                Navegue pelo cronograma sem sair da aula: clique para avançar ou abrir o exercício.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <TooltipProvider delayDuration={0}>
          <div className="relative space-y-3 pl-3">
            <div className="absolute left-2 top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary via-primary/30 to-transparent" />

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
                done: 'bg-green-500 text-white shadow-[0_0_0_4px] shadow-green-500/20',
                active: 'bg-primary text-white shadow-[0_0_0_4px] shadow-primary/30',
                pending: 'bg-muted text-muted-foreground',
              }[item.status]

              const pillTone = {
                lesson: 'bg-primary/10 text-primary border border-primary/30',
                exercise: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
                quiz: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
              }[item.type]

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
                <div key={`${item.id}-${index}`} className="relative pl-5">
                  <span
                    className={`absolute left-[-6px] top-2.5 flex h-6 w-6 items-center justify-center rounded-full ${statusClasses}`}
                  >
                    {icon}
                  </span>

                  <div
                    className={`group rounded-xl border transition-all duration-200 ${
                      isCurrentLesson
                        ? 'border-primary/60 bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border/60 bg-background/80'
                    }`}
                  >
                    <div className="flex flex-col gap-3 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <span className={`rounded-full px-2 py-1 ${pillTone}`}>
                          {isLesson ? 'Aula' : isExercise ? 'Exercício' : 'Quiz'}
                        </span>
                        <span className="text-muted-foreground/80">
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

        <div className="pt-4 text-center text-[11px] text-muted-foreground">
          Fluxo contínuo: Aula → Exercício → Quiz → próxima aula, tudo alinhado ao lado direito.
        </div>
      </Card>
    </aside>
  )
}
