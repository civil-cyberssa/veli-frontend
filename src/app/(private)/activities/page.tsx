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
  Calendar,
  TrendingUp,
  Filter
} from 'lucide-react'
import { useSubscriptions } from '@/src/features/dashboard/hooks/useSubscription'
import { useDailyActivities } from '@/src/features/dashboard/hooks/useDailyActivities'
import { DailyActivityModal } from '@/src/features/lessons/components/daily-activity-modal'
import type { DailyActivity } from '@/src/features/dashboard/hooks/useDailyActivities'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'completed' | 'pending'

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
  const [selectedActivity, setSelectedActivity] = useState<DailyActivity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: subscriptions, loading: isLoadingSubscriptions } = useSubscriptions()
  const { activities, isLoading, mutate } = useDailyActivities(selectedCourseId)

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

  const handleActivityClick = (activity: DailyActivity) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedActivity(null), 200)
  }

  const handleActivityComplete = () => {
    mutate()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Atividades Diárias
          </h1>
          <p className="text-lg text-muted-foreground">
            Pratique diariamente e acompanhe seu progresso
          </p>
        </div>

        {/* Course Selector & Stats */}
        <div className="grid gap-6 mb-8 lg:grid-cols-2">
          {/* Seletor de Curso */}
          <Card className="p-6 border-border/50">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Selecione o curso
            </label>
            <Select
              value={selectedCourseId?.toString() || ''}
              onValueChange={(value) => setSelectedCourseId(parseInt(value))}
              disabled={isLoadingSubscriptions}
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Escolha um curso para começar..." />
              </SelectTrigger>
              <SelectContent>
                {subscriptions?.map((subscription) => (
                  <SelectItem key={subscription.id} value={subscription.id.toString()}>
                    {subscription.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {subscriptions && subscriptions.length === 0 && !isLoadingSubscriptions && (
              <p className="text-sm text-muted-foreground mt-3">
                Você ainda não está inscrito em nenhum curso.
              </p>
            )}
          </Card>

          {/* Estatísticas */}
          {selectedCourseId && stats.total > 0 && (
            <Card className="p-6 border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Seu Progresso</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {stats.correct}
                  </div>
                  <div className="text-xs text-muted-foreground">Acertos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {stats.pending}
                  </div>
                  <div className="text-xs text-muted-foreground">Pendentes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">Taxa</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Filters */}
        {selectedCourseId && activities.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="h-8"
              >
                Todas ({activities.length})
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
                className="h-8"
              >
                Concluídas ({stats.completed})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
                className="h-8"
              >
                Pendentes ({stats.pending})
              </Button>
            </div>
          </div>
        )}

        {/* Activities Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : !selectedCourseId ? (
          <Card className="p-12 border-dashed">
            <div className="text-center">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Selecione um curso</h3>
              <p className="text-sm text-muted-foreground">
                Escolha um curso acima para ver as atividades disponíveis
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
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity, index) => {
              const colors = categoryColors[activity.category]

              return (
                <Card
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className={cn(
                    "p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
                    "border-border/50 hover:border-primary/50",
                    activity.is_done && "bg-muted/30"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeIn 0.3s ease-out',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1",
                        colors.bg,
                        colors.border,
                        colors.text
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", colors.dot)} />
                      {categoryLabels[activity.category]}
                    </Badge>

                    {activity.is_done ? (
                      activity.is_correct ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                      )
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base mb-2 line-clamp-2 leading-tight">
                    {activity.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {activity.statement}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{activity.available_on}</span>
                    </div>

                    {activity.is_done && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          activity.is_correct
                            ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400"
                        )}
                      >
                        {activity.is_correct ? '✓ Acertou' : '✗ Errou'}
                      </Badge>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <DailyActivityModal
        activity={selectedActivity}
        courseId={selectedCourseId}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onActivityComplete={handleActivityComplete}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
