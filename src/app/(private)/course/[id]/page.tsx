'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { useLesson } from '@/src/features/dashboard/hooks/useLesson'
import { useEventProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { useMarkLessonWatched } from '@/src/features/dashboard/hooks/useMarkLessonWatched'
import { useUpdateLessonRating } from '@/src/features/dashboard/hooks/useUpdateLessonRating'
import { useSubscriptions } from '@/src/features/dashboard/hooks/useSubscription'
import { LessonSidebarTabs } from '@/src/features/lessons/components/lesson-sidebar-tabs'
import { LessonOnboarding } from '@/src/features/lessons/components/lesson-onboarding'
import { VideoPlayer } from '@/src/features/lessons/components/video-player'
import { QuizView } from '@/src/features/lessons/components/quiz-view'
import { PlayCircle, CheckCircle2, Circle, ArrowLeft } from 'lucide-react'
import { LessonDescriptionCard } from '@/src/features/lessons/components/lesson-rating'
import { CourseTour } from '@/src/features/lessons/components/course-tour'
import { toast } from 'sonner'

export default function LessonPage() {
  const params = useParams()
  const courseId = params.id as string
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [autoplay, setAutoplay] = useState(true)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [quizState, setQuizState] = useState<{ eventId: number; name: string } | null>(null)
  const hasMarkedWatched = useRef<Set<number>>(new Set())

  const handleAutoplayChange = (checked: boolean) => {
    setAutoplay(checked)
  }
  const { data: eventProgress, isLoading: isProgressLoading, refetch: refetchProgress } = useEventProgress(courseId)

  // Buscar o event_id da lição selecionada
  const selectedLessonEventId = selectedLessonId
    ? eventProgress?.find((l) => l.lesson_id === selectedLessonId)?.event_id
    : undefined

  const { data: lesson, isLoading, error, refetch: refetchLesson } = useLesson(
    selectedLessonId ? String(selectedLessonId) : null,
    selectedLessonEventId
  )
  const { markAsWatched, isLoading: isMarkingWatched } = useMarkLessonWatched()
  const { updateRating, isLoading: isUpdatingRating } = useUpdateLessonRating()
  const { data: subscriptions } = useSubscriptions()

  const selectedLessonProgress = useMemo(
    () => eventProgress?.find((lesson) => lesson.lesson_id === selectedLessonId),
    [eventProgress, selectedLessonId]
  )

  const hasLessons = useMemo(() => eventProgress && eventProgress.length > 0, [eventProgress])

  const currentCourseName = useMemo(() => {
    const subscriptionCourse = subscriptions?.find(
      (subscription) => subscription.id === Number(courseId)
    )?.course_name

    return (
      subscriptionCourse ??
      selectedLessonProgress?.course_name ??
      selectedLessonProgress?.module_name ??
      'Curso atual'
    )
  }, [subscriptions, courseId, selectedLessonProgress])

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

  useEffect(() => {
    if (!selectedLessonId) return

    refetchLesson()
    refetchProgress()
  }, [selectedLessonId, refetchLesson, refetchProgress])

  const handleRatingChange = async (rating: number) => {
    if (!selectedLessonId || !eventProgress || selectedLessonProgress?.rating) return

    const currentLesson = eventProgress.find((l) => l.lesson_id === selectedLessonId)
    if (!currentLesson) return

    try {
      await refetchProgress(
        (currentLessons) =>
          currentLessons?.map((lesson) =>
            lesson.lesson_id === selectedLessonId
              ? {
                  ...lesson,
                  rating,
                }
              : lesson
          ) ?? currentLessons,
        { revalidate: false }
      )

      await updateRating({
        eventId: currentLesson.event_id,
        lessonId: selectedLessonId,
        rating,
      })

      // Recarregar o progresso para atualizar a UI
      await refetchProgress()

      toast.success('Obrigado pelo feedback!')
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err)
      refetchProgress()
      toast.error('Não foi possível salvar sua avaliação. Tente novamente.')
    }
  }

  const handleCommentSubmit = async (comment: string) => {
    if (!selectedLessonId || !eventProgress) return

    const currentLesson = eventProgress.find((l) => l.lesson_id === selectedLessonId)
    if (!currentLesson) return

    try {
      await refetchProgress(
        (currentLessons) =>
          currentLessons?.map((lesson) =>
            lesson.lesson_id === selectedLessonId
              ? {
                  ...lesson,
                  comment,
                }
              : lesson
          ) ?? currentLessons,
        { revalidate: false }
      )

      await updateRating({
        eventId: currentLesson.event_id,
        lessonId: selectedLessonId,
        comment,
      })

      await refetchProgress()

      toast.success('Obrigado pelo comentário!')
    } catch (err) {
      console.error('Erro ao salvar comentário:', err)
      refetchProgress()
      toast.error('Não foi possível salvar seu comentário. Tente novamente.')
    }
  }

  const handleMarkAsWatched = async () => {
    if (!selectedLessonId || !eventProgress) return

    const currentLesson = eventProgress.find((l) => l.lesson_id === selectedLessonId)
    if (!currentLesson || currentLesson.watched) {
      // Já está marcada como assistida, não precisa chamar a API novamente
      return
    }

    // Verificar se já tentamos marcar esta aula nesta sessão
    if (hasMarkedWatched.current.has(selectedLessonId)) {
      return
    }

    // Marcar como já processada para evitar chamadas duplicadas
    hasMarkedWatched.current.add(selectedLessonId)

    try {
      await markAsWatched({
        eventId: currentLesson.event_id,
        lessonId: selectedLessonId,
      })

      // Atualizar cache local imediatamente e revalidar com a API
      await refetchProgress(
        (currentLessons) =>
          currentLessons?.map((lesson) =>
            lesson.lesson_id === selectedLessonId
              ? {
                  ...lesson,
                  watched: true,
                  watched_at: new Date().toISOString(),
                }
              : lesson
          ) ?? currentLessons,
        { revalidate: true }
      )

      console.log('Aula marcada como assistida com sucesso')
    } catch (err) {
      console.error('Erro ao marcar aula como assistida:', err)
      // Em caso de erro, remover da lista para permitir nova tentativa
      hasMarkedWatched.current.delete(selectedLessonId)
    }
  }

  const handleOpenQuiz = (eventId: number, exerciseName: string) => {
    setQuizState({ eventId, name: exerciseName })
  }

  const handleCloseQuiz = () => {
    setQuizState(null)
    // Refetch para atualizar o score e o status de conclusão
    refetchProgress()
    refetchLesson()
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

      {/* Tour Interativo - guia o usuário pela página */}
      <CourseTour />

      <div className="pb-8">

        {/* Layout: Vídeo à esquerda (maior) | Lista de Aulas à direita (fixa) */}
        <div className={`grid grid-cols-1 gap-4 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:grid-cols-[1fr_64px]' : 'lg:grid-cols-4'
        }`}>
          {/* Coluna principal: Vídeo + Conteúdo adicional */}
          <div className={`space-y-4 ${sidebarCollapsed ? '' : 'lg:col-span-3'}`}>
            {/* Vídeo */}
            <div className="animate-scale-in animate-delay-100" data-tour="video-player">
              {lesson?.content_url ? (
                <VideoPlayer
                  url={lesson.content_url}
                  autoPlay={autoplay}
                  onProgress={(progress) => {
                    // Marcar como assistida quando atingir 90% do vídeo
                    if (progress.played >= 0.9) {
                      handleMarkAsWatched()
                    }
                  }}
                  onEnded={() => {
                    // Marcar aula como concluída quando o vídeo terminar
                    handleMarkAsWatched()
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
            <div className="animate-slide-up animate-delay-200" data-tour="lesson-description">
              <LessonDescriptionCard
                key={selectedLessonId ?? 'lesson-card'}
                title={lesson?.lesson_name}
                description={lesson?.description}
                courseName={currentCourseName}
                initialRating={selectedLessonProgress?.rating ?? null}
                initialComment={selectedLessonProgress?.comment ?? ''}
                isWatched={selectedLessonProgress?.watched ?? false}
                ratingDisabled={Boolean(selectedLessonProgress?.rating) || isUpdatingRating}
                onRatingChange={handleRatingChange}
                onSubmitComment={handleCommentSubmit}
                onMarkAsWatched={handleMarkAsWatched}
                isCommentSubmitting={isUpdatingRating}
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
              <div className="animate-slide-up animate-delay-200" data-tour="lesson-sidebar">
                {eventProgress ? (
                  <LessonSidebarTabs
                    lessons={eventProgress}
                    currentLessonId={selectedLessonId}
                    supportMaterialUrl={lesson?.support_material_url}
                    onCollapsedChange={setSidebarCollapsed}
                    onSelectLesson={setSelectedLessonId}
                    onOpenQuiz={handleOpenQuiz}
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

      {/* Quiz Modal/Overlay */}
      {quizState && (
        <QuizView
          eventId={quizState.eventId}
          exerciseName={quizState.name}
          subscriptionId={parseInt(courseId)}
          onClose={handleCloseQuiz}
        />
      )}
    </>
  )
}
