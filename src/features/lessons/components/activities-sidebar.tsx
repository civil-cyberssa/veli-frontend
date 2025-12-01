'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, FileText, BookOpen, ClipboardList } from 'lucide-react'
import { Activity } from '../../dashboard/hooks/useLesson'

interface ActivitiesSidebarProps {
  activities: Activity[]
}

const activityIcons = {
  quiz: ClipboardList,
  assignment: FileText,
  reading: BookOpen,
}

export function ActivitiesSidebar({ activities }: ActivitiesSidebarProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card className="p-6 border-border/50">
        <div className="text-center space-y-2">
          <ClipboardList className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">Nenhuma atividade disponível</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-border/50">
      <h2 className="text-lg font-semibold mb-4">Atividades</h2>

      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type] || FileText

          return (
            <div
              key={activity.id}
              className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {activity.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-sm">{activity.title}</h3>
                    </div>
                    <Badge
                      variant={activity.completed ? "default" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {activity.type === 'quiz' && 'Quiz'}
                      {activity.type === 'assignment' && 'Tarefa'}
                      {activity.type === 'reading' && 'Leitura'}
                    </Badge>
                  </div>

                  {activity.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                  )}

                  {activity.completed && activity.score !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground">Nota:</span>
                      <span className="font-medium">{activity.score}/100</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">
            {activities.filter(a => a.completed).length} de {activities.length}
          </span>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${(activities.filter(a => a.completed).length / activities.length) * 100}%`
            }}
          />
        </div>
      </div>
    </Card>
  )
}
