'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useLesson } from '@/src/features/dashboard/hooks/useLesson'
import { useEventProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { LessonRating } from '@/src/features/lessons/components/lesson-rating'
import { LessonSidebarTabs } from '@/src/features/lessons/components/lesson-sidebar-tabs'
import { LessonOnboarding } from '@/src/features/lessons/components/lesson-onboarding'
import { VideoPlayer } from '@/src/features/lessons/components/video-player'
import { PlayCircle, CheckCircle2, Circle, ArrowLeft } from 'lucide-react'

export default function LessonPage() {
  const params = useParams()
  const courseId = params.id as string
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [autoplay, setAutoplay] = useState(true)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  const handleAutoplayChange = (checked: boolean) => {
    setAutoplay(checked)
  }
  const { data: eventProgress, isLoading: isProgressLoading } = useEventProgress(courseId)
  const { data: lesson, isLoading, error } = useLesson(
    selectedLessonId ? String(selectedLessonId) : null
  )

  const hasLessons = useMemo(() => eventProgress && eventProgress.length > 0, [eventProgress])

  useEffect(() => {
    if (!eventProgress || eventProgress.length === 0) {
      setSelectedLessonId(null)
      return
    }

    const existsInList = eventProgress.some(
      (item) => item.lesson_id === selectedLessonId
    )

    if (!selectedLessonId || !existsInList) {
      setSelectedLessonId(eventProgress[0].lesson_id)
    }
  }, [eventProgress, selectedLessonId])

  const handleRatingChange = async (rating: number) => {
    // TODO: Implementar chamada à API para salvar o rating
    console.log('Rating changed to:', rating)
  }

  const isLessonLoading = (isLoading || isProgressLoading || !selectedLessonId) && !lesson

  if (isLessonLoading) {
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

  if (!hasLessons && !isProgressLoading) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground/40 text-4xl">📚</div>
          <p className="text-sm text-muted-foreground">Nenhuma aula disponível</p>
        </div>
      </div>
    )
  }

  if (!lesson && !isLoading) {
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
        <header className="flex items-center justify-between gap-4 border-b border-border/50 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
              {lesson?.lesson_name || 'Carregando aula...'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden text-sm text-muted-foreground sm:inline">Reprodução automática</span>
            <Switch checked={autoplay} onCheckedChange={handleAutoplayChange} aria-label="Reprodução automática" />
          </div>
        </header>

        {/* Layout: Vídeo à esquerda (maior) | Lista de Aulas à direita (fixa) */}
        <div className={`grid grid-cols-1 gap-4 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:grid-cols-[1fr_64px]' : 'lg:grid-cols-4'
        }`}>
          {/* Coluna principal: Vídeo + Conteúdo adicional */}
          <div className={`space-y-4 ${sidebarCollapsed ? '' : 'lg:col-span-3'}`}>
            {/* Vídeo */}
            <div className="animate-scale-in animate-delay-100">
              {lesson?.content_url ? (
                <VideoPlayer
                  url={lesson.content_url}
                  autoPlay={autoplay}
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
                initialRating={lesson?.rating ?? null}
                onRatingChange={handleRatingChange}
              />
            </div>

            {/* Atividades da Aula */}
            {lesson?.activities && lesson.activities.length > 0 && (
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
                    currentLessonId={selectedLessonId}
                    supportMaterialUrl={lesson.support_material_url}
                    exercise={lesson.exercise}
                    onCollapsedChange={setSidebarCollapsed}
                    onSelectLesson={setSelectedLessonId}
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
