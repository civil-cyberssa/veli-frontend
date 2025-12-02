"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useExercise } from "../hooks/useExercise"
import { CheckCircle2, Loader2, Pause, Play, Sparkles, XCircle } from "lucide-react"

interface ExerciseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string | null
  subscriptionId: number | null
}

const answerOptions: Array<{ key: "answer_a" | "answer_b" | "answer_c" | "answer_d"; label: string }> = [
  { key: "answer_a", label: "A" },
  { key: "answer_b", label: "B" },
  { key: "answer_c", label: "C" },
  { key: "answer_d", label: "D" },
]

export function ExerciseModal({ open, onOpenChange, eventId, subscriptionId }: ExerciseModalProps) {
  const { data: session } = useSession()
  const { data, isLoading, error, refetch } = useExercise(eventId, Boolean(eventId))
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({})

  const answersMap = useMemo(() => {
    if (!data?.answers) return {}
    return data.answers.reduce<Record<number, string>>((acc, answer) => {
      acc[answer.question_id] = answer.answer
      return acc
    }, {})
  }, [data])

  useEffect(() => {
    setSelectedAnswers(answersMap)
  }, [answersMap])

  const handleSelectAnswer = (questionId: number, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmitAnswer = async (questionId: number) => {
    if (!data?.exercise || !eventId) return

    if (!subscriptionId) {
      toast.error("Selecione um curso para enviar suas respostas.")
      return
    }

    const answer = selectedAnswers[questionId]

    if (!answer) {
      toast.error("Escolha uma alternativa para enviar.")
      return
    }

    setSubmitting((prev) => ({ ...prev, [questionId]: true }))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-portal/exercise-answers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access}`,
        },
        body: JSON.stringify({
          subscription: subscriptionId,
          exercise: data.exercise.id,
          question: questionId,
          event: data.event_id,
          answer,
        }),
      })

      if (!response.ok) {
        throw new Error("Não foi possível enviar a resposta.")
      }

      toast.success("Resposta enviada com sucesso!")
      await refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar resposta.")
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  const totalQuestions = data?.exercise.questions_count ?? 0
  const answered = data?.answers_count ?? 0
  const progress = totalQuestions ? Math.round((answered / totalQuestions) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[min(960px,90vw)] overflow-hidden p-0">
        <div className="relative h-full overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

          <div className="relative space-y-4 p-6">
            <DialogHeader className="gap-1 sm:gap-2">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Responder exercício
              </DialogTitle>
              <DialogDescription className="max-w-2xl text-muted-foreground">
                Responda com rapidez: as questões já são pré-carregadas para evitar atrasos e você acompanha o progresso em tempo real.
              </DialogDescription>
            </DialogHeader>

            {isLoading && (
              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando questões...
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <XCircle className="h-4 w-4" />
                {error.message}
              </div>
            )}

            {!isLoading && !error && data && (
              <>
                <div className="grid gap-3 rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold leading-tight">{data.exercise.name}</p>
                    <p className="text-xs text-muted-foreground">Aula #{data.lesson_id} • Evento #{data.event_id}</p>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{answered}/{totalQuestions} questões respondidas</span>
                      {data.score !== null && (
                        <Badge variant="secondary" className="font-medium">Nota atual: {data.score}</Badge>
                      )}
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 pr-1 sm:pr-2">
                  {data.questions.map((question) => {
                    const currentAnswer = selectedAnswers[question.id]
                    const sentAnswer = answersMap[question.id]
                    const isAnswered = Boolean(sentAnswer)

                    return (
                      <Card
                        key={question.id}
                        className="border-border/60 bg-background/70 p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold">{question.name}</p>
                            {question.statement && (
                              <p className="mt-1 text-xs text-muted-foreground">{question.statement}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant={isAnswered ? "outline" : "secondary"} className="flex items-center gap-1">
                              {isAnswered ? (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              ) : (
                                <Pause className="h-3 w-3" />
                              )}
                              {isAnswered ? `Respondida (${sentAnswer})` : "Pendente"}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {answerOptions.map(({ key, label }) => (
                            <Button
                              key={key}
                              type="button"
                              variant={currentAnswer === label ? "default" : "outline"}
                              className="justify-start gap-3 text-left transition-colors"
                              onClick={() => handleSelectAnswer(question.id, label)}
                            >
                              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                                {label}
                              </span>
                              <span className="text-sm leading-snug text-foreground/90">{question[key]}</span>
                            </Button>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitAnswer(question.id)}
                            disabled={submitting[question.id]}
                          >
                            {submitting[question.id] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Enviar resposta
                              </>
                            )}
                          </Button>
                          {isAnswered && (
                            <span className="text-xs text-muted-foreground">
                              Última resposta enviada: {sentAnswer}
                            </span>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
