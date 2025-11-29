'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, Clock, BookOpen, ArrowRight } from 'lucide-react'
import { useNextAsyncLesson } from '../hooks/useNextAsyncLesson'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NextAsyncLessonCard() {
  const { data: nextLesson, isLoading, error } = useNextAsyncLesson()
  const router = useRouter()

  const handleNavigateToProgress = () => {
    if (nextLesson) {
      router.push(`/event-progress/${nextLesson.event_id}`)
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border/50 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border/50 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-destructive">Erro ao carregar próxima aula</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!nextLesson) {
    return (
      <Card className="border-border/50 overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <PlayCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">Próxima Aula</h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nenhuma aula pendente</p>
            <p className="text-xs text-muted-foreground/70">
              Você está em dia com o conteúdo!
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const formattedDate = nextLesson.scheduled_datetime
    ? format(new Date(nextLesson.scheduled_datetime), "dd/MM/yyyy - HH:mm", { locale: ptBR })
    : 'Data não disponível'

  return (
    <Card className="border-border/50 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <PlayCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold">Próxima Aula</h3>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
            {nextLesson.watched ? 'Revisar' : 'Nova'}
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Module and Date Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-medium">{nextLesson.module_name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Lesson Info */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-900/5 border border-purple-200/50 dark:border-purple-800/30">
            <p className="text-sm font-medium text-muted-foreground mb-1">Aula</p>
            <p className="text-base font-semibold text-foreground">{nextLesson.lesson_name}</p>

            {nextLesson.watched && nextLesson.watched_at && (
              <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/30">
                <p className="text-xs text-muted-foreground">
                  Assistida em {format(new Date(nextLesson.watched_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            )}

            {nextLesson.exercise_score !== null && (
              <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Pontuação do exercício</p>
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                    {nextLesson.exercise_score} pts
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleNavigateToProgress}
            >
              {nextLesson.watched ? 'Ver progresso' : 'Começar aula'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
