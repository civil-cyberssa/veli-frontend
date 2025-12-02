'use client'

import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLesson } from '@/src/features/dashboard/hooks/useLesson'
import { useEventProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { LessonRating } from '@/src/features/lessons/components/lesson-rating'
import { LessonsList } from '@/src/features/lessons/components/lessons-list'
import { LessonOnboarding } from '@/src/features/lessons/components/lesson-onboarding'
import { PlayCircle, FileText, Download, Calendar, CheckCircle2, Circle } from 'lucide-react'

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id as string

  const { data: lesson, isLoading, error } = useLesson(lessonId)
  // TODO: Pegar o event_id real da aula atual
  const { data: eventProgress } = useEventProgress('1')

  const handleRatingChange = async (rating: number) => {
    // TODO: Implementar chamada à API para salvar o rating
    console.log('Rating changed to:', rating)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-muted"></div>
          <div className="absolute top-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Carregando aula...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="text-destructive text-4xl">⚠️</div>
          <p className="text-sm text-destructive">Erro ao carregar aula: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground/40 text-4xl">📚</div>
          <p className="text-sm text-muted-foreground">Aula não encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Onboarding - aparece apenas na primeira vez */}
      <LessonOnboarding />

      <div className="pb-8">
        {/* Header com informações da aula */}
        <div className="mb-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {lesson.module.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Aula {lesson.order}
            </Badge>
            {lesson.is_weekly && (
              <Badge variant="default" className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Semanal
              </Badge>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {lesson.lesson_name}
          </h1>
        </div>

        {/* Layout: Vídeo à esquerda (maior) | Lista de Aulas à direita (fixa) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Coluna principal: Vídeo + Conteúdo adicional */}
          <div className="lg:col-span-3 space-y-4">
            {/* Vídeo */}
            <Card className="border-border/50 overflow-hidden animate-scale-in animate-delay-100">
              <div className="relative aspect-video bg-black">
                {lesson.content_url ? (
                  <video
                    controls
                    className="w-full h-full"
                    src={lesson.content_url}
                    poster=""
                  >
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <PlayCircle className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm text-muted-foreground">Vídeo não disponível</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Rating */}
            <div className="animate-slide-up animate-delay-200">
              <LessonRating
                initialRating={lesson.rating}
                onRatingChange={handleRatingChange}
              />
            </div>

            {/* Conteúdo adicional: Material de Apoio e Exercícios */}
            <div className="space-y-3 animate-slide-up animate-delay-300">
              {/* Material de Apoio */}
              {lesson.support_material_url && (
                <Card className="p-3 border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Material de Apoio</h3>
                        <p className="text-xs text-muted-foreground">
                          Documento complementar
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={lesson.support_material_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </a>
                    </Button>
                  </div>
                </Card>
              )}

              {/* Exercício */}
              {lesson.exercise && (
                <Card className="p-3 border-border/50 bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{lesson.exercise.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {lesson.exercise.questions_count} questões
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Iniciar
                    </Button>
                  </div>
                </Card>
              )}

              {/* Atividades Mock */}
              {lesson.activities && lesson.activities.length > 0 && (
                <Card className="p-3 border-border/50">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold mb-2">Atividades da Aula</h3>
                    <div className="space-y-2">
                      {lesson.activities.slice(0, 3).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          {activity.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-xs">{activity.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar direita: Lista de Aulas (sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-4">
              <div className="animate-slide-up animate-delay-200">
                {eventProgress ? (
                  <LessonsList
                    lessons={eventProgress}
                    currentLessonId={lesson.id}
                  />
                ) : (
                  <Card className="p-6 border-border/50">
                    <div className="text-center space-y-2">
                      <PlayCircle className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm text-muted-foreground">Carregando aulas...</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
