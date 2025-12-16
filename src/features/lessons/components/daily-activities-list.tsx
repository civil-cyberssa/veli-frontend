'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Circle,
  Calendar,
  Loader2,
  ClipboardList,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDailyActivities, type DailyActivity } from '@/src/features/dashboard/hooks/useDailyActivities'
import { DailyActivityModal } from './daily-activity-modal'

interface DailyActivitiesListProps {
  courseId: number | null
}

const categoryColors = {
  culture: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  sport: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  education: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  other: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
}

const categoryLabels = {
  culture: 'Cultura',
  sport: 'Esporte',
  education: 'Educação',
  other: 'Outro',
}

export function DailyActivitiesList({ courseId }: DailyActivitiesListProps) {
  const [selectedActivity, setSelectedActivity] = useState<DailyActivity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { activities, isLoading, mutate } = useDailyActivities(courseId)

  const handleActivityClick = (activity: DailyActivity) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    // Aguardar animação de fechamento antes de limpar
    setTimeout(() => setSelectedActivity(null), 200)
  }

  const handleActivityComplete = () => {
    // Revalidar a lista de atividades
    mutate()
  }

  const completedCount = activities.filter(a => a.is_done).length
  const totalCount = activities.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <>
      <Card className="border overflow-hidden" data-tour="daily-activities">
        {/* Header */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h3 className="text-xs sm:text-sm font-medium text-foreground">
                Atividades Diárias
              </h3>
            </div>
            {totalCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                  {completedCount} de {totalCount}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  {Math.round(progressPercentage)}%
                </Badge>
              </div>
            )}
          </div>

          {/* Barra de progresso */}
          {totalCount > 0 && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Lista de Atividades */}
        <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="p-3 sm:p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !courseId ? (
            <div className="p-6 sm:p-8 text-center">
              <ClipboardList className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Selecione um curso para ver as atividades
              </p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <ClipboardList className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                Nenhuma atividade disponível
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/70">
                As atividades aparecerão aqui quando estiverem disponíveis
              </p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-2">
              {activities.map((activity, index) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(activity)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all",
                    "hover:border-primary/50 hover:bg-muted/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    activity.is_done && "bg-muted/30"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeIn 0.3s ease-out',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone de status */}
                    <div className="mt-0.5 flex-shrink-0">
                      {activity.is_done ? (
                        activity.is_correct ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-red-600" />
                        )
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm text-foreground line-clamp-1">
                          {activity.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 shrink-0",
                            categoryColors[activity.category]
                          )}
                        >
                          {categoryLabels[activity.category]}
                        </Badge>
                      </div>

                      {activity.statement && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {activity.statement}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{activity.available_on}</span>
                        </div>

                        {activity.is_done && (
                          <div className="flex items-center gap-1">
                            {activity.is_correct ? (
                              <span className="text-[10px] font-medium text-green-600">
                                ✓ Acertou
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-red-600">
                                ✗ Errou
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer com estatísticas */}
        {totalCount > 0 && (
          <div className="border-t px-3 sm:px-4 py-2.5 sm:py-3 bg-muted/30">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Seu desempenho</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {activities.filter(a => a.is_done && a.is_correct).length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">
                    {activities.filter(a => !a.is_done).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de atividade */}
      <DailyActivityModal
        activity={selectedActivity}
        courseId={courseId}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onActivityComplete={handleActivityComplete}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
