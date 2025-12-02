'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLesson } from '@/src/features/dashboard/hooks/useLesson'
import { useEventProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { LessonRating } from '@/src/features/lessons/components/lesson-rating'
import { LessonSidebarTabs } from '@/src/features/lessons/components/lesson-sidebar-tabs'
import { LessonOnboarding } from '@/src/features/lessons/components/lesson-onboarding'
import { VideoPlayer } from '@/src/features/lessons/components/video-player'
import { PlayCircle, Calendar, CheckCircle2, Circle } from 'lucide-react'

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id as string
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
        <div className={`grid grid-cols-1 gap-4 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:grid-cols-[1fr_64px]' : 'lg:grid-cols-4'
        }`}>
          {/* Coluna principal: Vídeo + Conteúdo adicional */}
          <div className={`space-y-4 ${sidebarCollapsed ? '' : 'lg:col-span-3'}`}>
            {/* Vídeo */}
            <div className="animate-scale-in animate-delay-100">
              {lesson.content_url ? (
                <VideoPlayer
                  url={lesson.content_url}
                  onProgress={(progress) => {
                    // TODO: Salvar progresso da aula
                    console.log('Progress:', progress)
                  }}
                  onEnded={() => {
                    // TODO: Marcar aula como concluída
                    console.log('Video ended')
                  }}
                />
              ) : (
                <Card className="border-border/50 overflow-hidden">
                  <div className="relative aspect-video bg-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <PlayCircle className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                        <p className="text-sm text-muted-foreground">Vídeo não disponível</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Rating */}
            <div className="animate-slide-up animate-delay-200">
              <LessonRating
                initialRating={lesson.rating}
                onRatingChange={handleRatingChange}
              />
            </div>

            {/* Atividades da Aula */}
            {lesson.activities && lesson.activities.length > 0 && (
              <div className="animate-slide-up animate-delay-300">
                <Card className="p-4 border-border/50">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Atividades da Aula</h3>
                    <div className="space-y-2">
                      {lesson.activities.slice(0, 3).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
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
              </div>
            )}
          </div>

          {/* Sidebar direita: Tabs com Conteúdo, Material e Exercício (sticky) */}
          <div className={sidebarCollapsed ? '' : 'lg:col-span-1'}>
            <div className="lg:sticky lg:top-4">
              <div className="animate-slide-up animate-delay-200">
                {eventProgress ? (
                  <LessonSidebarTabs
                    lessons={eventProgress}
                    currentLessonId={lesson.id}
                    supportMaterialUrl={lesson.support_material_url}
                    exercise={lesson.exercise}
                    onCollapsedChange={setSidebarCollapsed}
                  />
                ) : (
                  <Card className="p-6 border-border/50">
                    <div className="text-center space-y-2">
                      <PlayCircle className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm text-muted-foreground">Carregando...</p>
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
