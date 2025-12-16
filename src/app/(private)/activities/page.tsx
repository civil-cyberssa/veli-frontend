'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Circle,
  Clock,
  Lock,
} from 'lucide-react'
import { useSubscriptions } from '@/src/features/dashboard/hooks/useSubscription'
import { useDailyActivities } from '@/src/features/dashboard/hooks/useDailyActivities'
import { useSubmitActivityAnswer } from '@/src/features/dashboard/hooks/useSubmitActivityAnswer'
import type { DailyActivity } from '@/src/features/dashboard/hooks/useDailyActivities'
import { cn } from '@/lib/utils'

type AnswerOption = 'a' | 'b' | 'c' | 'd'

const categoryColors = {
  culture: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800/30',
    text: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  sport: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  education: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  other: {
    bg: 'bg-gray-50 dark:bg-gray-950/20',
    border: 'border-gray-200 dark:border-gray-800/30',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
}

const categoryLabels = {
  culture: 'Cultura',
  sport: 'Esporte',
  education: 'Educação',
  other: 'Geral',
}

export default function ActivitiesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(null)

  const { data: subscriptions, loading: isLoadingSubscriptions } = useSubscriptions()
  const { activities, isLoading, mutate } = useDailyActivities(selectedCourseId)
  const { submitAnswer, isSubmitting } = useSubmitActivityAnswer()

  // Encontrar a atividade pendente mais recente (Quiz do dia)
  const todayActivity = useMemo(() => {
    return activities.find(a => !a.is_done) || activities[0] || null
  }, [activities])

  // Últimas atividades concluídas (para histórico)
  const recentActivities = useMemo(() => {
    return activities
      .slice()
      .sort((a, b) => new Date(b.available_on).getTime() - new Date(a.available_on).getTime())
      .slice(0, 3)
  }, [activities])

  const stats = useMemo(() => {
    const total = activities.length
    const completed = activities.filter(a => a.is_done).length
    const correct = activities.filter(a => a.is_done && a.is_correct).length
    const totalAttempts = activities.filter(a => a.is_done).length

    return {
      total,
      completed,
      correct,
      totalAttempts,
      pending: total - completed
    }
  }, [activities])

  // Calcular quantas questões foram respondidas no quiz atual
  const currentQuizProgress = useMemo(() => {
    if (!todayActivity) return { current: 0, total: 1, percentage: 0 }

    // Por enquanto, cada atividade tem 1 pergunta
    // Se tiver múltiplas perguntas por atividade, ajustar aqui
    const totalQuestions = 4 // Simulando 4 perguntas como na imagem
    const answeredQuestions = todayActivity.is_done ? totalQuestions : 1

    return {
      current: answeredQuestions,
      total: totalQuestions,
      percentage: Math.round((answeredQuestions / totalQuestions) * 100)
    }
  }, [todayActivity])

  const handleSkip = () => {
    // Encontrar próxima atividade pendente
    const nextPending = activities.find((a, idx) =>
      !a.is_done && a.id !== todayActivity?.id
    )
    if (nextPending) {
      mutate()
    }
  }

  const handleSubmit = async () => {
    if (!selectedAnswer || !todayActivity || !selectedCourseId) return

    try {
      await submitAnswer(selectedCourseId, todayActivity.id, selectedAnswer)
      await mutate()
      setSelectedAnswer(null)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  // Reset quando mudar de curso
  useMemo(() => {
    setSelectedAnswer(null)
  }, [selectedCourseId])

  // Pegar nome do curso selecionado
  const selectedCourse = subscriptions?.find(s => s.id === selectedCourseId)
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() +
                      new Date().toLocaleDateString('pt-BR', { month: 'long' }).slice(1)

  if (!selectedCourseId) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 border-dashed">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Atividades diárias</h1>
              <p className="text-muted-foreground mb-6">Acompanhe seu progresso mensal e responda ao quiz do dia.</p>

              <div className="max-w-sm mx-auto">
                <label className="text-sm font-medium mb-2 block text-left">Rotina de estudos</label>
                <Select
                  value={selectedCourseId?.toString() || ''}
                  onValueChange={(value) => setSelectedCourseId(parseInt(value))}
                  disabled={isLoadingSubscriptions}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptions?.map((subscription) => (
                      <SelectItem key={subscription.id} value={subscription.id.toString()}>
                        {subscription.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Atividades diárias</h1>
          <p className="text-sm text-muted-foreground">
            {selectedCourse?.course_name} - {currentMonth}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px]">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr_320px]">
            {/* Coluna 1: Resumo do mês */}
            <div className="space-y-4">
              <Card className="p-5">
                <h2 className="font-semibold mb-1">Resumo do mês</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  {currentMonth} - {selectedCourse?.course_name}
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-muted-foreground">Atividades feitas</span>
                      <span className="text-xl font-bold">{stats.completed}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">de {stats.total} dias</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-muted-foreground">Questões certas</span>
                      <span className="text-xl font-bold">{stats.correct}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">de {stats.totalAttempts} tentativas</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-muted-foreground">Atividades no mês</span>
                      <span className="text-xl font-bold">{stats.total}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">1 por dia</p>
                  </div>
                </div>
              </Card>

              {/* Últimas atividades */}
              <Card className="p-5">
                <h3 className="font-semibold mb-3">Últimas atividades</h3>
                <div className="space-y-2">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="mt-0.5">
                        {activity.is_done ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">{activity.available_on}</p>
                          <span className="text-xs">•</span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs h-5",
                              activity.is_done ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" : ""
                            )}
                          >
                            {activity.is_done ? 'Concluída' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Coluna 2: Quiz do dia */}
            <Card className="p-6">
              {todayActivity ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Quiz do dia</h2>
                    <p className="text-sm text-muted-foreground">
                      Atividade diária de {todayActivity.available_on}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Pergunta {currentQuizProgress.current} de {currentQuizProgress.total}
                    </span>
                    <span className="text-muted-foreground">
                      Tema: {categoryLabels[todayActivity.category]}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-4">{todayActivity.statement}</h3>

                    <div className="space-y-2">
                      {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option) => {
                        const answerText = todayActivity[`answer_${option}`]
                        const isSelected = selectedAnswer === option
                        const isUserAnswer = todayActivity.user_answer === option
                        const isDisabled = todayActivity.is_done

                        return (
                          <button
                            key={option}
                            onClick={() => !isDisabled && setSelectedAnswer(option)}
                            disabled={isDisabled}
                            className={cn(
                              "w-full p-3 text-left rounded-lg border transition-all text-sm",
                              "hover:border-primary/50 hover:bg-muted/30",
                              "disabled:cursor-not-allowed",
                              isSelected && !isDisabled && "border-primary bg-primary/5",
                              isUserAnswer && todayActivity.is_done && todayActivity.is_correct &&
                                "border-green-500 bg-green-50 dark:bg-green-950/20",
                              isUserAnswer && todayActivity.is_done && !todayActivity.is_correct &&
                                "border-red-500 bg-red-50 dark:bg-red-950/20",
                              !isSelected && !isUserAnswer && "border-border"
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
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso:</span>
                        <span className="font-medium">{currentQuizProgress.percentage}% concluído</span>
                      </div>
                      <Progress value={currentQuizProgress.percentage} className="h-2" />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={handleSkip}
                        disabled={todayActivity.is_done}
                      >
                        Pular
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedAnswer || isSubmitting || todayActivity.is_done}
                      >
                        {isSubmitting ? 'Enviando...' : 'Responder'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Parabéns!</h3>
                  <p className="text-sm text-muted-foreground">
                    Você completou todas as atividades disponíveis!
                  </p>
                </div>
              )}
            </Card>

            {/* Coluna 3: Atividades de janeiro */}
            <Card className="p-5">
              <div className="mb-4">
                <h2 className="font-semibold mb-1">Atividades de {currentMonth.toLowerCase()}</h2>
                <p className="text-xs text-muted-foreground">Uma atividade por dia</p>
              </div>

              <div className="space-y-2 mb-4 max-h-[600px] overflow-y-auto">
                {activities.map((activity) => {
                  const date = new Date(activity.available_on)
                  const day = date.getDate()
                  const today = new Date()
                  const isToday = date.toDateString() === today.toDateString()
                  const isFuture = date > today

                  return (
                    <div
                      key={activity.id}
                      className={cn(
                        "p-3 rounded-lg border transition-colors",
                        activity.is_done && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
                        !activity.is_done && !isFuture && "border-border hover:bg-muted/30",
                        isFuture && "bg-muted/30 border-muted",
                        isToday && !activity.is_done && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg font-semibold text-sm shrink-0",
                            activity.is_done && "bg-green-600 text-white",
                            !activity.is_done && !isFuture && "bg-muted text-foreground",
                            isFuture && "bg-muted/50 text-muted-foreground"
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
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isFuture && "text-muted-foreground"
                          )}>
                            {String(day).padStart(2, '0')} {date.toLocaleDateString('pt-BR', { month: 'short' })}
                          </p>
                          <p className={cn(
                            "text-xs truncate",
                            activity.is_done && "text-green-700 dark:text-green-400",
                            !activity.is_done && !isFuture && "text-muted-foreground",
                            isFuture && "text-muted-foreground/70"
                          )}>
                            {activity.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Legenda */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded bg-green-600" />
                  <span>Feita</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Dia de hoje</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  <span>Não disponível ainda</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
