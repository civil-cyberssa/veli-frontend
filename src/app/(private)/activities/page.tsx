'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { useSubscriptions } from '@/src/features/dashboard/hooks/useSubscription'
import { useDailyActivities } from '@/src/features/dashboard/hooks/useDailyActivities'
import { useSubmitActivityAnswer } from '@/src/features/dashboard/hooks/useSubmitActivityAnswer'
import type { DailyActivity } from '@/src/features/dashboard/hooks/useDailyActivities'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'completed' | 'pending'
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
  const [filter, setFilter] = useState<FilterType>('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption | null>(null)

  const { data: subscriptions, loading: isLoadingSubscriptions } = useSubscriptions()
  const { activities, isLoading, mutate } = useDailyActivities(selectedCourseId)
  const { submitAnswer, isSubmitting } = useSubmitActivityAnswer()

  const filteredActivities = useMemo(() => {
    if (filter === 'completed') return activities.filter(a => a.is_done)
    if (filter === 'pending') return activities.filter(a => !a.is_done)
    return activities
  }, [activities, filter])

  const stats = useMemo(() => {
    const total = activities.length
    const completed = activities.filter(a => a.is_done).length
    const correct = activities.filter(a => a.is_done && a.is_correct).length
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

    return { total, completed, correct, percentage, pending: total - completed }
  }, [activities])

  const currentActivity = filteredActivities[currentIndex] || null

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setSelectedAnswer(null)
    }
  }

  const handleNext = () => {
    if (currentIndex < filteredActivities.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
    }
  }

  const handleSkip = () => {
    handleNext()
  }

  const handleSubmit = async () => {
    if (!selectedAnswer || !currentActivity || !selectedCourseId) return

    try {
      await submitAnswer(selectedCourseId, currentActivity.id, selectedAnswer)
      await mutate()

      // Move to next activity after short delay
      setTimeout(() => {
        if (currentIndex < filteredActivities.length - 1) {
          handleNext()
        }
      }, 1500)
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  // Reset current index when filter changes
  useMemo(() => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
  }, [filter, selectedCourseId])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
        {/* Header with Course Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Atividades Diárias</h1>
            <p className="text-sm text-muted-foreground">
              Pratique diariamente e acompanhe seu progresso
            </p>
          </div>

          <Select
            value={selectedCourseId?.toString() || ''}
            onValueChange={(value) => setSelectedCourseId(parseInt(value))}
            disabled={isLoadingSubscriptions}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Selecione o curso" />
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

        {/* Filters and Stats */}
        {selectedCourseId && activities.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas ({activities.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendentes ({stats.pending})
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Concluídas ({stats.completed})
              </Button>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Taxa de acertos:</span>
                <span className="font-semibold text-primary">{stats.percentage}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <Card className="p-8">
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-32 bg-muted rounded w-full" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded" />
                ))}
              </div>
            </div>
          </Card>
        ) : !selectedCourseId ? (
          <Card className="p-12 border-dashed">
            <div className="text-center">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Selecione um curso</h3>
              <p className="text-sm text-muted-foreground">
                Escolha um curso acima para começar a praticar
              </p>
            </div>
          </Card>
        ) : filteredActivities.length === 0 ? (
          <Card className="p-12 border-dashed">
            <div className="text-center">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">
                {filter === 'completed' && 'Nenhuma atividade concluída'}
                {filter === 'pending' && 'Nenhuma atividade pendente'}
                {filter === 'all' && 'Nenhuma atividade disponível'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {filter !== 'all'
                  ? 'Tente selecionar outro filtro'
                  : 'As atividades aparecerão aqui quando estiverem disponíveis'}
              </p>
            </div>
          </Card>
        ) : currentActivity ? (
          <Card className="overflow-hidden">
            {/* Progress Header */}
            <div className="px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      categoryColors[currentActivity.category].bg,
                      categoryColors[currentActivity.category].border,
                      categoryColors[currentActivity.category].text
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full mr-1.5",
                        categoryColors[currentActivity.category].dot
                      )}
                    />
                    {categoryLabels[currentActivity.category]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Questão {currentIndex + 1} de {filteredActivities.length}
                  </span>
                </div>

                {currentActivity.is_done && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      currentActivity.is_correct
                        ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                    )}
                  >
                    {currentActivity.is_correct ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Acertou
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Errou
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>

            {/* Activity Content */}
            <div className="p-6 space-y-6">
              {/* Question */}
              <div>
                <h2 className="text-xl font-semibold mb-2">{currentActivity.name}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {currentActivity.statement}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option) => {
                  const answerText = currentActivity[`answer_${option}`]
                  const isSelected = selectedAnswer === option
                  const isUserAnswer = currentActivity.user_answer === option
                  const isDisabled = currentActivity.is_done

                  return (
                    <button
                      key={option}
                      onClick={() => !isDisabled && setSelectedAnswer(option)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full p-4 text-left rounded-lg border-2 transition-all",
                        "hover:border-primary/50 hover:bg-muted/50",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        isSelected && !isDisabled && "border-primary bg-primary/5",
                        isUserAnswer && currentActivity.is_done && currentActivity.is_correct &&
                          "border-green-500 bg-green-50 dark:bg-green-950/20",
                        isUserAnswer && currentActivity.is_done && !currentActivity.is_correct &&
                          "border-red-500 bg-red-50 dark:bg-red-950/20",
                        !isSelected && !isUserAnswer && "border-border"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm",
                            isSelected && !isDisabled && "border-primary bg-primary text-primary-foreground",
                            isUserAnswer && currentActivity.is_done && currentActivity.is_correct &&
                              "border-green-500 bg-green-500 text-white",
                            isUserAnswer && currentActivity.is_done && !currentActivity.is_correct &&
                              "border-red-500 bg-red-500 text-white",
                            !isSelected && !isUserAnswer && "border-muted-foreground/30"
                          )}
                        >
                          {option.toUpperCase()}
                        </div>
                        <span className="flex-1">{answerText}</span>
                        {isUserAnswer && currentActivity.is_done && (
                          currentActivity.is_correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="px-6 py-4 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex gap-2">
                  {!currentActivity.is_done && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleSkip}
                        disabled={currentIndex === filteredActivities.length - 1}
                      >
                        Pular
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedAnswer || isSubmitting}
                      >
                        {isSubmitting ? 'Enviando...' : 'Confirmar resposta'}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentIndex === filteredActivities.length - 1}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
