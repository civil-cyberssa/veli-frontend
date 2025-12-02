'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLesson } from '@/src/features/dashboard/hooks/useLesson'
import { useEventProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { LessonRating } from '@/src/features/lessons/components/lesson-rating'
import { ActivitiesSidebar } from '@/src/features/lessons/components/activities-sidebar'
import { LessonsList } from '@/src/features/lessons/components/lessons-list'
import { LessonOnboarding } from '@/src/features/lessons/components/lesson-onboarding'
import { PlayCircle, FileText, Download, Calendar } from 'lucide-react'
import { ExerciseModal } from '@/src/features/lessons/components/exercise-modal'
import { useSubscriptions } from '@/src/features/dashboard/hooks/useSubscription'

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id as string

  const { selectedId: subscriptionId } = useSubscriptions()
  const { data: lesson, isLoading, error } = useLesson(lessonId)
  const { data: eventProgress } = useEventProgress(
    subscriptionId ? subscriptionId.toString() : null
  )
  const currentLessonEvent = eventProgress?.find(
    (event) => event.lesson_id === Number(lessonId)
  )
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    if (currentLessonEvent?.event_id) {
      setSelectedEventId(currentLessonEvent.event_id.toString())
    }
  }, [currentLessonEvent])

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
        {/* Header com animação */}
        <div className="mb-6 animate-slide-up">
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
          <Badge variant="outline" className="text-xs capitalize">
            {lesson.lesson_type === 'asynchronous' ? 'Assíncrona' : 'Ao vivo'}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lesson.lesson_name}
        </h1>
      </div>

      {/* Layout: Vídeo à esquerda | Lista de Aulas à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal: Vídeo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vídeo com animação */}
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

          {/* Tabs com conteúdo adicional */}
          <Tabs defaultValue="rating" className="animate-slide-up animate-delay-200">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rating">Avaliação</TabsTrigger>
              <TabsTrigger value="materials">Materiais</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
            </TabsList>

            {/* Tab: Rating */}
            <TabsContent value="rating" className="space-y-4">
              <LessonRating
                initialRating={lesson.rating}
                onRatingChange={handleRatingChange}
              />
            </TabsContent>

            {/* Tab: Materiais */}
            <TabsContent value="materials" className="space-y-4">
              {lesson.support_material_url && (
                <Card className="p-4 border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Material de Apoio</h3>
                        <p className="text-xs text-muted-foreground">
                          Documento complementar da aula
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
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </a>
                    </Button>
                  </div>
                </Card>
              )}

              {lesson.exercise && (
                <Card className="p-4 border-border/50 bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-1">{lesson.exercise.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Este exercício contém {lesson.exercise.questions_count} questões
                      </p>
                      {currentLessonEvent?.exercise && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentLessonEvent.exercise.answers_count}/
                          {currentLessonEvent.exercise.questions_count} questões respondidas
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (currentLessonEvent?.event_id) {
                            setSelectedEventId(currentLessonEvent.event_id.toString())
                            setIsExerciseModalOpen(true)
                          }
                        }}
                        disabled={!currentLessonEvent?.event_id || !subscriptionId}
                      >
                        Responder
                      </Button>
                      {!subscriptionId && (
                        <p className="text-[11px] text-muted-foreground text-right">
                          Selecione um curso para liberar o exercício.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {!lesson.support_material_url && !lesson.exercise && (
                <Card className="p-8 border-border/50">
                  <div className="text-center space-y-2">
                    <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">Nenhum material disponível</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Atividades */}
            <TabsContent value="activities">
              <ActivitiesSidebar activities={lesson.activities || []} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar: Lista de Aulas com animação */}
        <div className="lg:col-span-1 animate-slide-up animate-delay-200">
          {eventProgress ? (
            <LessonsList
              lessons={eventProgress}
              currentLessonId={lesson.id}
              onExerciseOpen={subscriptionId ? (lessonProgress) => {
                setSelectedEventId(lessonProgress.event_id.toString())
                setIsExerciseModalOpen(true)
              } : undefined}
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
      <ExerciseModal
        open={isExerciseModalOpen}
        onOpenChange={setIsExerciseModalOpen}
        eventId={selectedEventId}
        subscriptionId={subscriptionId}
      />
    </div>
    </>
  )
}
