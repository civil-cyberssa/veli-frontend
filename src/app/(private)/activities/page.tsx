'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useDailyActivities,
  useDailyActivity,
  useDailyActivitiesSummary,
  useTodayDailyActivity,
  type DailyActivity,
} from '@/src/features/dashboard/hooks/useDailyActivities'
import { useSubmitActivityAnswer } from '@/src/features/dashboard/hooks/useSubmitActivityAnswer'
import { useSubscriptions } from '@/src/features/dashboard/hooks/useSubscription'

type AnswerOption = 'a' | 'b' | 'c' | 'd'
type ActivityFilter = 'all' | 'available' | 'locked'

const parseAvailableDate = (dateString: string) => {
  if (dateString.includes('-')) return new Date(dateString)

  const [day, month, year] = dateString.split('/').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

const isFutureAvailable = (dateString: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const availableDate = parseAvailableDate(dateString)
  availableDate.setHours(0, 0, 0, 0)

  return availableDate.getTime() > today.getTime()
}

const isTodayDate = (dateString: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const availableDate = parseAvailableDate(dateString)
  availableDate.setHours(0, 0, 0, 0)

  return availableDate.getTime() === today.getTime()
}

export default function ActivitiesPage() {
  const { data: subscriptions, loading: isLoadingSubscriptions, selectedSubscription, setSelectedSubscription } =
    useSubscriptions()

  const [courseId, setCourseId] = useState<number | null>(null)
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(null)
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all')

  const { activities: monthActivities, isLoading: isLoadingMonth, mutate: mutateMonth } =
    useDailyActivities(courseId)
  const { summary, isLoading: isLoadingSummary } = useDailyActivitiesSummary(courseId)
  const { activity: todayActivity, isLoading: isLoadingToday, mutate: mutateToday } =
    useTodayDailyActivity(courseId)
  const {
    activity: selectedActivity,
    isLoading: isLoadingSelected,
    mutate: mutateSelectedActivity,
  } = useDailyActivity(courseId, selectedActivityId)
  const { submitAnswer, isSubmitting } = useSubmitActivityAnswer()

  const activeActivity = selectedActivityId ? selectedActivity : todayActivity
  const isLoadingActive = selectedActivityId ? isLoadingSelected : isLoadingToday

  useEffect(() => {
    if (!selectedSubscription && subscriptions?.length) {
      setSelectedSubscription(subscriptions[0])
    }
  }, [selectedSubscription, setSelectedSubscription, subscriptions])

  useEffect(() => {
    setCourseId(selectedSubscription?.id ?? null)
  }, [selectedSubscription?.id])

  useEffect(() => {
    setSelectedActivityId(null)
    setSelectedAnswer(null)
  }, [courseId])

  useEffect(() => {
    if (activeActivity?.user_answer) {
      setSelectedAnswer(activeActivity.user_answer)
    } else {
      setSelectedAnswer(null)
    }
  }, [activeActivity?.id, activeActivity?.user_answer])

  const summaryMonthLabel = useMemo(() => {
    if (summary?.month) {
      return new Date(summary.month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }

    return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }, [summary?.month])

  const correctCount = useMemo(() => {
    if (summary?.total_correct !== undefined) return summary.total_correct
    return monthActivities.filter((activity) => activity.is_done && activity.is_correct).length
  }, [monthActivities, summary?.total_correct])

  const totalActivities = summary?.total_activities ?? monthActivities.length
  const completedActivities = summary?.total_answered ??
    monthActivities.filter((activity) => activity.is_done).length
  const incorrectCount = useMemo(() => {
    if (summary?.total_answered !== undefined && summary.total_correct !== undefined) {
      return Math.max(summary.total_answered - summary.total_correct, 0)
    }

    return monthActivities.filter((activity) => activity.is_done && activity.is_correct === false).length
  }, [monthActivities, summary?.total_answered, summary?.total_correct])

  const completionRate = totalActivities > 0
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0
  const totalAttempts = correctCount + incorrectCount
  const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

  const completionTrend = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return monthActivities
      .slice()
      .sort(
        (a, b) =>
          parseAvailableDate(a.available_on).getTime() - parseAvailableDate(b.available_on).getTime()
      )
      .map((activity) => {
        const activityDate = parseAvailableDate(activity.available_on)
        activityDate.setHours(0, 0, 0, 0)

        const isToday = activityDate.getTime() === today.getTime()
        const status = activity.is_done
          ? 'done'
          : activityDate.getTime() > today.getTime()
            ? 'locked'
            : 'available'

        return {
          id: activity.id,
          day: activityDate.getDate(),
          status,
          isToday,
        }
      })
  }, [monthActivities])

  const handleSelectActivity = (activity: DailyActivity) => {
    const isFuture = isFutureAvailable(activity.available_on)
    if (isFuture) return
    setSelectedActivityId(activity.id)
  }

  const handleSubmit = async () => {
    if (!selectedAnswer || !activeActivity || !courseId) return

    try {
      await submitAnswer(courseId, activeActivity.id, selectedAnswer)
      await Promise.all([mutateMonth(), mutateToday(), mutateSelectedActivity()])
    } catch (error) {
      console.error(error)
    }
  }

  const isFutureActivity = activeActivity ? isFutureAvailable(activeActivity.available_on) : false

  const formatDate = (dateString: string) => {
    const parsedDate = parseAvailableDate(dateString)
    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'available') {
      return monthActivities.filter((activity) => !isFutureAvailable(activity.available_on))
    }

    if (activityFilter === 'locked') {
      return monthActivities.filter((activity) => isFutureAvailable(activity.available_on))
    }

    return monthActivities
  }, [activityFilter, monthActivities])

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url)

      if (parsed.hostname.includes('youtu.be')) {
        const videoId = parsed.pathname.replace('/', '')
        if (videoId) return `https://www.youtube.com/embed/${videoId}`
      }

      if (parsed.hostname.includes('youtube.com')) {
        const videoId = parsed.searchParams.get('v')
        if (videoId) return `https://www.youtube.com/embed/${videoId}`

        const pathSegments = parsed.pathname.split('/').filter(Boolean)
        const embedIndex = pathSegments.indexOf('embed')

        if (embedIndex !== -1 && pathSegments[embedIndex + 1]) {
          return `https://www.youtube.com/embed/${pathSegments[embedIndex + 1]}`
        }
      }

      return url
    } catch {
      return url
    }
  }

  const renderActivityMedia = (activity: DailyActivity | null) => {
    if (!activity) return null

    const youtubeLink = activity.video_yt_link ?? activity.atvideo_yt_link

    if (activity.activity_type === 'video' && activity.file) {
      return (
        <div className="overflow-hidden rounded-lg border bg-black/5">
          <video controls className="h-full w-full max-h-[360px] bg-black">
            <source src={activity.file} />
            Seu navegador não suporta o elemento de vídeo.
          </video>
        </div>
      )
    }

    if (activity.activity_type === 'audio' && activity.file) {
      return (
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="mb-2 text-sm font-medium">Ouça o áudio antes de responder:</p>
          <audio controls className="w-full">
            <source src={activity.file} />
            Seu navegador não suporta o elemento de áudio.
          </audio>
        </div>
      )
    }

    if (activity.activity_type === 'image' && activity.file) {
      return (
        <div className="overflow-hidden rounded-lg border bg-muted/30">
          <div className="relative h-64 w-full">
            <Image
              src={activity.file}
              alt={activity.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 640px"
              unoptimized
            />
          </div>
        </div>
      )
    }

    if (activity.activity_type === 'file' && activity.file) {
      return (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-4 text-sm">
          <p className="font-medium">Baixe o arquivo para consultar antes de responder:</p>
          <div>
            <Button asChild variant="outline">
              <a href={activity.file} target="_blank" rel="noreferrer">
                Abrir arquivo
              </a>
            </Button>
          </div>
        </div>
      )
    }

    if (activity.activity_type === 'video_youtube' && youtubeLink) {
      const embedUrl = getYoutubeEmbedUrl(youtubeLink)

      return (
        <div className="overflow-hidden rounded-lg border">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-[1400px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Atividades diárias</h1>
            <p className="text-sm text-muted-foreground">
              Visualize o resumo mensal, responda o quiz do dia e revise outras atividades.
            </p>
          </div>
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Curso</p>
              {isLoadingSubscriptions ? (
                <div className="flex h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando cursos...
                </div>
              ) : subscriptions && subscriptions.length > 1 ? (
                <Select
                  value={selectedSubscription?.id ? String(selectedSubscription.id) : undefined}
                  onValueChange={(value) => {
                    const subscription = subscriptions.find((item) => item.id === Number(value))
                    if (subscription) {
                      setSelectedSubscription(subscription)
                    }
                  }}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptions.map((subscription) => (
                      <SelectItem key={subscription.id} value={String(subscription.id)}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={subscription.course_icon}
                            alt={subscription.course_name}
                            width={18}
                            height={18}
                            className="h-4 w-4 rounded-full object-cover"
                          />
                          <span>{subscription.course_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : selectedSubscription ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                  <Image
                    src={selectedSubscription.course_icon}
                    alt={selectedSubscription.course_name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground">Curso selecionado</span>
                    <span className="text-sm font-medium leading-tight">{selectedSubscription.course_name}</span>
                  </div>
                </div>
              ) : (
                <div className="flex h-10 items-center rounded-lg border px-3 text-sm text-muted-foreground">
                  Nenhum curso disponível
                </div>
              )}
            </div>
            {selectedActivityId && (
              <Button variant="outline" onClick={() => setSelectedActivityId(null)}>
                Voltar para atividade do dia
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr_340px]">
          {/* Resumo do mês */}
          <Card className="p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Resumo do mês</h2>
                <p className="text-xs text-muted-foreground capitalize">{summaryMonthLabel}</p>
              </div>
              {isLoadingSummary && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Atividades concluídas</span>
                <span className="font-semibold">{completedActivities} / {totalActivities}</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progresso mensal</span>
                <span>{completionRate}%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Taxa de acerto</p>
                <p className="text-2xl font-semibold">{accuracyRate}%</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-muted-foreground">Certas</p>
                  <p className="text-lg font-semibold text-green-600">{correctCount}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-muted-foreground">Erradas</p>
                  <p className="text-lg font-semibold text-red-600">{incorrectCount}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-muted-foreground">Pendentes</p>
                  <p className="text-lg font-semibold">{Math.max(totalActivities - completedActivities, 0)}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Andamento diário</p>
                <span className="text-[11px] text-muted-foreground">Visão geral do mês</span>
              </div>
              <div className="rounded-2xl border bg-gradient-to-b from-muted/50 via-background to-background p-4 shadow-sm">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Concluída</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary/70" />
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <span>Bloqueada</span>
                  </div>
                </div>

                <div className="mt-4 flex h-32 items-end gap-2 overflow-hidden">
                  {completionTrend.map((item) => {
                    const barHeight = item.status === 'done' ? 96 : item.status === 'available' ? 68 : 32
                    const barColor =
                      item.status === 'done'
                        ? 'from-emerald-500/80 to-emerald-400'
                        : item.status === 'available'
                          ? 'from-primary/20 to-primary/60'
                          : 'from-muted-foreground/20 to-muted-foreground/30'

                    return (
                      <div key={item.id} className="flex-1 min-w-[10px]">
                        <div className="relative flex flex-col items-center gap-2">
                          <div
                            className={cn(
                              'w-full rounded-full bg-gradient-to-t shadow-sm transition-all',
                              barColor,
                              item.isToday && 'ring-2 ring-primary/50 ring-offset-2'
                            )}
                            style={{ height: `${barHeight}px` }}
                          />
                          <p
                            className={cn(
                              'text-[10px] text-center text-muted-foreground',
                              item.isToday && 'text-primary font-semibold'
                            )}
                          >
                            {String(item.day).padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {completionTrend.length === 0 && (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Sem dados do mês
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Quiz do dia / atividade selecionada */}
          <Card className="p-6">
            {isLoadingActive ? (
              <div className="flex h-full min-h-[420px] items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              ) : activeActivity ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Disponível em {formatDate(activeActivity.available_on)}
                    </p>
                    <h2 className="text-lg font-semibold">
                      {selectedActivityId ? 'Atividade selecionada' : 'Quiz do dia'}
                    </h2>
                    {activeActivity.category && (
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {activeActivity.category}
                      </Badge>
                    )}
                  </div>
                  {activeActivity.is_done && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[11px] border-0 bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-200',
                        activeActivity.is_correct === false &&
                          'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {activeActivity.is_correct ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {activeActivity.is_correct ? 'Você acertou' : 'Você errou'}
                      </span>
                    </Badge>
                  )}
                </div>

                {renderActivityMedia(activeActivity)}

                <div className="space-y-2">
                  <p className="text-sm font-medium">{activeActivity.statement}</p>
                  <div className="space-y-2">
                    {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option) => {
                      const answerText = activeActivity[`answer_${option}`]
                      const isSelected = selectedAnswer === option
                      const isUserAnswer = activeActivity.user_answer === option
                      const isDisabled = activeActivity.is_done || isSubmitting || isFutureActivity

                      return (
                        <button
                          key={option}
                          onClick={() => !isDisabled && setSelectedAnswer(option)}
                          disabled={isDisabled}
                          className={cn(
                            'w-full p-3 text-left rounded-lg border transition-all text-sm',
                            'hover:border-primary/50 hover:bg-muted/30 disabled:cursor-not-allowed',
                            isSelected && !activeActivity.is_done && 'border-primary bg-primary/5',
                            isUserAnswer && activeActivity.is_done && activeActivity.is_correct &&
                              'border-green-500 bg-green-50 dark:bg-green-950/20',
                            isUserAnswer && activeActivity.is_done && activeActivity.is_correct === false &&
                              'border-red-500 bg-red-50 dark:bg-red-950/20'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{option.toUpperCase()}</span>
                            <span className="flex-1">{answerText}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {activeActivity.is_done && (
                    <div className={cn(
                      'flex items-center gap-2 text-sm rounded-lg border p-3',
                      activeActivity.is_correct ? 'border-green-500/40 bg-green-50/50 dark:bg-green-950/20' :
                        'border-red-500/40 bg-red-50/50 dark:bg-red-950/20'
                    )}>
                      {activeActivity.is_correct ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>
                        {activeActivity.is_correct
                          ? 'Você já respondeu corretamente esta atividade.'
                          : 'Você respondeu esta atividade, mas errou a questão.'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Progresso</span>
                    <span>{activeActivity.is_done ? '100%' : selectedAnswer ? '50%' : '0%'}</span>
                  </div>
                  <Progress value={activeActivity.is_done ? 100 : selectedAnswer ? 50 : 15} className="h-2" />

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => mutateToday()}
                      disabled={isSubmitting || isLoadingToday}
                    >
                      Atualizar
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedAnswer || isSubmitting || activeActivity.is_done || isFutureActivity}
                    >
                      {isSubmitting ? 'Enviando...' : 'Responder'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center space-y-3 text-center text-muted-foreground">
                <CheckCircle2 className="h-10 w-10" />
                <p>Nenhuma atividade disponível para hoje.</p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Atividades</h2>
              </div>

              <div className="flex items-center gap-3">
                <Select value={activityFilter} onValueChange={(value) => setActivityFilter(value as ActivityFilter)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar atividades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="available">Liberadas</SelectItem>
                    <SelectItem value="locked">Bloqueadas</SelectItem>
                  </SelectContent>
                </Select>
                {isLoadingMonth && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredActivities.map((activity) => {
                const date = parseAvailableDate(activity.available_on)
                const day = date.getDate()
                const isToday = isTodayDate(activity.available_on)
                const isFuture = isFutureAvailable(activity.available_on)

                return (
                  <button
                    key={activity.id}
                    onClick={() => handleSelectActivity(activity)}
                    disabled={isFuture}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-colors',
                      selectedActivityId === activity.id && 'border-primary bg-primary/5',
                      activity.is_done && 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
                      !activity.is_done && !isFuture && 'border-border hover:bg-muted/30',
                      isFuture && 'bg-muted/30 border-muted text-muted-foreground',
                      isToday && !activity.is_done && 'border-primary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex items-center justify-center w-10 h-10 rounded-lg font-semibold text-sm shrink-0',
                          activity.is_done && 'bg-green-600 text-white',
                          !activity.is_done && !isFuture && 'bg-muted text-foreground',
                          isFuture && 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        {activity.is_done ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isFuture ? (
                          <Lock className="h-4 w-4" />
                        ) : isToday ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          String(day).padStart(2, '0')
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {String(day).padStart(2, '0')} {date.toLocaleDateString('pt-BR', { month: 'short' })}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{activity.name}</p>
                      </div>
                      {activity.is_done ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] border-0 bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-200',
                            !activity.is_correct &&
                              'bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {activity.is_correct ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {activity.is_correct ? 'Acertou' : 'Errou'}
                          </span>
                        </Badge>
                      ) : isFuture ? (
                        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                          Bloqueada
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Liberada
                        </Badge>
                      )}
                    </div>
                  </button>
                )
              })}

              {!isLoadingMonth && filteredActivities.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Nenhuma atividade disponível para este filtro.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
