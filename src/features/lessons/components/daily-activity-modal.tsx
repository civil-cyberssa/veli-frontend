'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useDailyActivity,
  useSubmitActivityAnswer,
  type DailyActivity
} from '@/src/features/dashboard/hooks/useDailyActivities'
import { toast } from 'sonner'

interface DailyActivityModalProps {
  activity: DailyActivity | null
  courseId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivityComplete?: () => void
}

const categoryLabels = {
  culture: 'Cultura',
  sport: 'Esporte',
  education: 'Educação',
  other: 'Outro',
}

const answerOptions = [
  { key: 'a' as const, label: 'A' },
  { key: 'b' as const, label: 'B' },
  { key: 'c' as const, label: 'C' },
  { key: 'd' as const, label: 'D' },
]

export function DailyActivityModal({
  activity: initialActivity,
  courseId,
  open,
  onOpenChange,
  onActivityComplete,
}: DailyActivityModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null)

  const { activity: detailedActivity, isLoading } = useDailyActivity(
    courseId,
    initialActivity?.id || null
  )

  const { trigger: submitAnswer, isMutating } = useSubmitActivityAnswer()

  const activity = detailedActivity || initialActivity

  const handleSubmit = async () => {
    if (!activity || !courseId || !selectedAnswer) return

    try {
      await submitAnswer({
        courseId,
        activityId: activity.id,
        answer: selectedAnswer,
      })

      toast.success('Resposta enviada com sucesso!')
      onActivityComplete?.()

      // Aguardar um pouco antes de fechar para mostrar o resultado
      setTimeout(() => {
        onOpenChange(false)
        setSelectedAnswer(null)
      }, 2000)
    } catch (error) {
      toast.error('Erro ao enviar resposta')
      console.error('Erro ao submeter resposta:', error)
    }
  }

  if (!activity) return null

  const isCompleted = activity.is_done
  const userAnswer = activity.user_answer
  const correctAnswer = activity.answer_id

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-start justify-between gap-4 mb-2">
            <AlertDialogTitle className="text-xl">{activity.name}</AlertDialogTitle>
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {categoryLabels[activity.category]}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Disponível em: {activity.available_on}</span>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-1">
                {activity.is_correct ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600 font-medium">Acertou!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-red-600 font-medium">Errou</span>
                  </>
                )}
              </div>
            )}
          </div>
        </AlertDialogHeader>

        {isLoading ? (
          <div className="py-8 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando atividade...</p>
          </div>
        ) : (
          <>
            <AlertDialogDescription asChild>
              <div className="space-y-6">
                {/* Enunciado */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-foreground mb-2">Enunciado:</h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {activity.statement}
                  </p>
                </div>

                {/* Opções de resposta */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">Escolha uma alternativa:</h3>
                  <div className="space-y-2">
                    {answerOptions.map((option) => {
                      const answerKey = `answer_${option.key}` as keyof DailyActivity
                      const answerText = activity[answerKey] as string
                      const isSelected = selectedAnswer === option.key
                      const isUserAnswer = userAnswer === option.key
                      const isCorrectOption = correctAnswer && activity.is_done &&
                        (option.key === 'a' && correctAnswer === 1 ||
                         option.key === 'b' && correctAnswer === 2 ||
                         option.key === 'c' && correctAnswer === 3 ||
                         option.key === 'd' && correctAnswer === 4)

                      return (
                        <button
                          key={option.key}
                          onClick={() => !isCompleted && setSelectedAnswer(option.key)}
                          disabled={isCompleted || isMutating}
                          className={cn(
                            "w-full text-left p-4 rounded-lg border-2 transition-all",
                            "hover:border-primary/50 disabled:cursor-not-allowed",
                            isSelected && !isCompleted && "border-primary bg-primary/5",
                            !isSelected && !isCompleted && "border-border",
                            isCompleted && isCorrectOption && "border-green-500 bg-green-50 dark:bg-green-950/20",
                            isCompleted && isUserAnswer && !isCorrectOption && "border-red-500 bg-red-50 dark:bg-red-950/20",
                            isCompleted && !isUserAnswer && !isCorrectOption && "border-border opacity-60"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium",
                              isSelected && !isCompleted && "border-primary bg-primary text-primary-foreground",
                              !isSelected && !isCompleted && "border-border",
                              isCompleted && isCorrectOption && "border-green-500 bg-green-500 text-white",
                              isCompleted && isUserAnswer && !isCorrectOption && "border-red-500 bg-red-500 text-white",
                              isCompleted && !isUserAnswer && !isCorrectOption && "border-border"
                            )}>
                              {isCompleted && isCorrectOption ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : isCompleted && isUserAnswer && !isCorrectOption ? (
                                <XCircle className="h-5 w-5" />
                              ) : (
                                option.label
                              )}
                            </div>
                            <p className="flex-1 text-sm leading-relaxed pt-1">
                              {answerText}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mensagem de status */}
                {!isCompleted && !selectedAnswer && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <p className="text-xs">
                      Selecione uma alternativa e clique em "Enviar Resposta"
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>

            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                onClick={() => {
                  setSelectedAnswer(null)
                }}
              >
                {isCompleted ? 'Fechar' : 'Cancelar'}
              </AlertDialogCancel>

              {!isCompleted && (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || isMutating}
                  className="min-w-[140px]"
                >
                  {isMutating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Resposta'
                  )}
                </Button>
              )}
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
