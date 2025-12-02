'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Star, PlayCircle } from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import Link from 'next/link'

interface LessonsListProps {
  lessons: LessonProgress[]
  currentLessonId: number
}

export function LessonsList({ lessons, currentLessonId }: LessonsListProps) {
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

  // Agrupar aulas por módulo
  const lessonsByModule = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module_name]) {
      acc[lesson.module_name] = []
    }
    acc[lesson.module_name].push(lesson)
    return acc
  }, {} as Record<string, LessonProgress[]>)

  return (
    <Card className="p-4 border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Aulas do Curso</h2>
          <Badge variant="secondary" className="text-xs">
            {lessons.filter(l => l.watched).length}/{lessons.length} assistidas
          </Badge>
        </div>

        <div className="space-y-6">
          {Object.entries(lessonsByModule).map(([moduleName, moduleLessons]) => (
            <div key={moduleName} className="space-y-2">
              {/* Nome do módulo */}
              <h3 className="text-sm font-medium text-muted-foreground px-2">
                {moduleName}
              </h3>

              {/* Lista de aulas do módulo */}
              <div className="space-y-1">
                {moduleLessons.map((lesson) => {
                  const isCurrentLesson = lesson.lesson_id === currentLessonId
                  const hasExercise = lesson.exercise && lesson.exercise.answers_count > 0

                  return (
                    <Link
                      key={lesson.lesson_id}
                      href={`/aulas/${lesson.lesson_id}`}
                    >
                      <div
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isCurrentLesson
                            ? 'bg-primary/10 border-primary/50 shadow-sm'
                            : 'border-border/50 hover:bg-muted/50 hover:border-border'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Ícone de status */}
                          <div className="mt-0.5 shrink-0">
                            {lesson.watched ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div>
                              <h4 className={`text-sm font-medium line-clamp-2 ${
                                isCurrentLesson ? 'text-primary' : ''
                              }`}>
                                {lesson.lesson_name}
                              </h4>
                            </div>

                            {/* Rating e Exercício */}
                            <div className="flex items-center gap-3 text-xs">
                              {/* Rating */}
                              {lesson.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-muted-foreground">{lesson.rating}/5</span>
                                </div>
                              )}

                              {/* Exercício */}
                              {hasExercise && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs h-5 px-1.5">
                                    {lesson.exercise!.answers_count}/{lesson.exercise!.questions_count} questões
                                  </Badge>
                                </div>
                              )}

                              {/* Score do exercício */}
                              {lesson.exercise_score !== null && (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    Nota: {lesson.exercise_score}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Progresso geral */}
        <div className="pt-4 border-t border-border/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso do Curso</span>
              <span className="font-medium">
                {Math.round((lessons.filter(l => l.watched).length / lessons.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${(lessons.filter(l => l.watched).length / lessons.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
