'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { useAllLessons } from '@/src/features/dashboard/hooks/useAllLessons'
import { useEventProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { useMarkLessonWatched } from '@/src/features/dashboard/hooks/useMarkLessonWatched'
import { useUpdateLessonRating } from '@/src/features/dashboard/hooks/useUpdateLessonRating'
import { useSubscriptions } from '@/src/features/dashboard/hooks/useSubscription'
import { useCreateLessonComment } from '@/src/features/dashboard/hooks/useCreateLessonComment'
import { useUpdateLessonComment } from '@/src/features/dashboard/hooks/useUpdateLessonComment'
import { useDeleteLessonComment } from '@/src/features/dashboard/hooks/useDeleteLessonComment'
import { useLessonComments } from '@/src/features/dashboard/hooks/useLessonComments'
import { LessonSidebarTabs } from '@/src/features/lessons/components/lesson-sidebar-tabs'
import { LessonOnboarding } from '@/src/features/lessons/components/lesson-onboarding'
import { VideoPlayer } from '@/src/features/lessons/components/video-player'
import { QuizView } from '@/src/features/lessons/components/quiz-view'
import { PlayCircle } from 'lucide-react'
import { LessonDescriptionCard } from '@/src/features/lessons/components/lesson-rating'
import { LessonInteractionTabs } from '@/src/features/lessons/components/lesson-interaction-tabs'
import { useLessonDoubts } from '@/src/features/lessons/hooks/useLessonDoubts'
import { QuizPromptModal } from '@/src/features/lessons/components/quiz-prompt-modal'
import { CourseTour } from '@/src/features/lessons/components/course-tour'
import { MobileLessonOverview } from '@/src/features/lessons/components/mobile-lesson-overview'
import { toast } from 'sonner'
import { LogoPulseLoader } from '@/components/shared/logo-loader'

export default function LessonPage() {
  const params = useParams()
  const courseId = params.id as string
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const autoplay = true
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [quizState, setQuizState] = useState<{ eventId: number; name: string } | null>(null)
  const [quizPromptState, setQuizPromptState] = useState<{
    eventId: number;
    name: string;
    questionsCount: number
  } | null>(null)
  const hasMarkedWatched = useRef<Set<number>>(new Set())
  const autoMarkTriggered = useRef(false)
  const [watchProgress, setWatchProgress] = useState(0)

  const { data: eventProgress, isLoading: isProgressLoading, refetch: refetchProgress } = useEventProgress(courseId)

  // Pré-carregar todas as lições de uma vez
  const { lessons: allLessons, isLoading: isLoadingAllLessons, error, refetch: refetchAllLessons } = useAllLessons(courseId)

  // Obter a lição atual do Map de lições pré-carregadas
  const lesson = useMemo(() => {
    if (!allLessons || !selectedLessonId) return null
    return allLessons.get(selectedLessonId) || null
  }, [allLessons, selectedLessonId])
  const { markAsWatched, isLoading: isMarkingWatched } = useMarkLessonWatched()
  const { updateRating, isLoading: isUpdatingRating } = useUpdateLessonRating()
  const { data: subscriptions } = useSubscriptions()
  const { createComment, isLoading: isCreatingComment } = useCreateLessonComment()
  const { updateComment } = useUpdateLessonComment()
  const { deleteComment } = useDeleteLessonComment()
  const { data: commentsData, refetch: refetchComments } = useLessonComments(selectedLessonId)

  const selectedLessonProgress = useMemo(
    () => eventProgress?.find((lesson) => lesson.lesson_id === selectedLessonId),
    [eventProgress, selectedLessonId]
  )

  // Usar student_class_id se disponível, senão usar courseId da URL
  const registrationIdForDoubts = selectedLessonProgress?.student_class_id ?? (courseId ? parseInt(courseId) : undefined)

  const { data: doubtsData = [] } = useLessonDoubts(
    registrationIdForDoubts,
    selectedLessonId ?? undefined
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

    // Apenas atualizar o progresso, as lições já foram pré-carregadas
    refetchProgress()
  }, [selectedLessonId, refetchProgress])

  useEffect(() => {
    setWatchProgress(0)
    autoMarkTriggered.current = false
  }, [selectedLessonId])

  useEffect(() => {
    if (selectedLessonProgress?.watched) {
      setWatchProgress(1)
      autoMarkTriggered.current = true
    }
  }, [selectedLessonProgress?.watched])

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
    if (!selectedLessonId) return

    try {
      // Usar o novo endpoint de criação de comentários
      await createComment({
        lessonId: selectedLessonId,
        comment,
      })

      // Recarregar os comentários e o progresso
      await refetchComments()
      await refetchProgress()

      toast.success('Obrigado pelo comentário!')
    } catch (err) {
      console.error('Erro ao salvar comentário:', err)
      toast.error('Não foi possível salvar seu comentário. Tente novamente.')
    }
  }

  const handleEditComment = async (commentId: number, newComment: string) => {
    try {
      await updateComment({
        commentId,
        comment: newComment,
      })

      // Recarregar os comentários
      await refetchComments()

      toast.success('Comentário atualizado!')
    } catch (err) {
      console.error('Erro ao atualizar comentário:', err)
      toast.error('Não foi possível atualizar seu comentário. Tente novamente.')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment({ commentId })

      // Recarregar os comentários
      await refetchComments()

      toast.success('Comentário excluído!')
    } catch (err) {
      console.error('Erro ao excluir comentário:', err)
      toast.error('Não foi possível excluir seu comentário. Tente novamente.')
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
    autoMarkTriggered.current = true

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

      // Mostrar modal de prompt de quiz se houver exercício disponível
      if (currentLesson.exercise && currentLesson.exercise.questions_count > 0) {
        setQuizPromptState({
          eventId: currentLesson.exercise.id,
          name: currentLesson.exercise.name,
          questionsCount: currentLesson.exercise.questions_count,
        })
      }
    } catch (err) {
      console.error('Erro ao marcar aula como assistida:', err)
      // Em caso de erro, remover da lista para permitir nova tentativa
      hasMarkedWatched.current.delete(selectedLessonId)
      autoMarkTriggered.current = false
    }
  }

  const handleOpenQuiz = (eventId: number, exerciseName: string) => {
    setQuizState({ eventId, name: exerciseName })
  }

  const handleCloseQuiz = () => {
    setQuizState(null)
    // Refetch para atualizar o score e o status de conclusão
    refetchProgress()
    refetchAllLessons()
  }

  const isLessonLoading = (isLoadingAllLessons || isProgressLoading) && !lesson

  if (isLessonLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
        <LogoPulseLoader label="Carregando aula..." />
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

  if (!lesson && !isLoadingAllLessons && selectedLessonId) {
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
            <div className="-mx-6 -mt-4 animate-scale-in animate-delay-100 md:mx-0 md:mt-0" data-tour="video-player">
              {lesson?.content_url ? (
                <VideoPlayer
                  url={lesson.content_url}
                  autoPlay={autoplay}
                  onProgress={(progress) => {
                    setWatchProgress(progress.played)

                    // Marcar como assistida quando atingir 90% do vídeo
                    if (
                      !selectedLessonProgress?.watched &&
                      !autoMarkTriggered.current &&
                      progress.played >= 0.9
                    ) {
                      autoMarkTriggered.current = true
                      handleMarkAsWatched()
                    }
                  }}
                  onEnded={() => {
                    // Marcar aula como concluída quando o vídeo terminar
                    setWatchProgress(1)
                    handleMarkAsWatched()
                  }}
                />
              ) : (
                <Card className="overflow-hidden rounded-none border-0 border-border/50 lg:rounded-xl lg:border">
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
              <MobileLessonOverview
                key={`mobile-${selectedLessonId ?? 'lesson'}`}
                title={lesson?.lesson_name}
                description={lesson?.description}
                initialRating={selectedLessonProgress?.rating ?? null}
                ratingDisabled={Boolean(selectedLessonProgress?.rating) || isUpdatingRating}
                onRatingChange={handleRatingChange}
                eventId={selectedLessonProgress?.event_id}
                exercise={selectedLessonProgress?.exercise ?? null}
                supportMaterialUrl={lesson?.support_material_url}
                onOpenQuiz={handleOpenQuiz}
              />

              <div className="hidden lg:block">
                <LessonDescriptionCard
                  key={selectedLessonId ?? 'lesson-card'}
                  title={lesson?.lesson_name}
                  description={lesson?.description}
                  courseName={currentCourseName}
                  initialRating={selectedLessonProgress?.rating ?? null}
                  isWatched={selectedLessonProgress?.watched ?? false}
                  ratingDisabled={Boolean(selectedLessonProgress?.rating) || isUpdatingRating}
                  onRatingChange={handleRatingChange}
                  onMarkAsWatched={handleMarkAsWatched}
                  watchProgress={watchProgress}
                  isMarkingWatched={isMarkingWatched}
                  eventId={selectedLessonProgress?.event_id}
                  exercise={selectedLessonProgress?.exercise ?? null}
                  exerciseScore={selectedLessonProgress?.exercise_score ?? null}
                  supportMaterialUrl={lesson?.support_material_url}
                  onOpenQuiz={handleOpenQuiz}
                />
              </div>
            </div>

            {/* Comentários e Perguntas ao Professor */}
            <div className="animate-slide-up animate-delay-250">
              <LessonInteractionTabs
                commentsData={commentsData}
                isLoadingComments={!selectedLessonId}
                onSubmitComment={handleCommentSubmit}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                isSubmittingComment={isCreatingComment}
                lessonId={selectedLessonId || 0}
                registrationId={registrationIdForDoubts}
                doubtsCount={doubtsData.length}
              />
            </div>

         
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
                  />
                ) : (
                  <Card className="p-6 border-border/50">
                    <LogoPulseLoader label="Carregando..." size={56} />
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Prompt Modal */}
      {quizPromptState && (
        <QuizPromptModal
          open={!!quizPromptState}
          onOpenChange={(open) => !open && setQuizPromptState(null)}
          exerciseName={quizPromptState.name}
          questionsCount={quizPromptState.questionsCount}
          onStartNow={() => {
            setQuizState({
              eventId: quizPromptState.eventId,
              name: quizPromptState.name,
            })
            setQuizPromptState(null)
          }}
          onLater={() => {
            setQuizPromptState(null)
          }}
        />
      )}

      {/* Quiz Modal/Overlay */}
      {quizState && selectedLessonProgress && (
        <QuizView
          eventId={quizState.eventId}
          exerciseName={quizState.name}
          subscriptionId={selectedLessonProgress.student_class_id ?? parseInt(courseId)}
          onClose={handleCloseQuiz}
        />
      )}
    </>
  )
}
