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
import { useExercise } from "../hooks/useExercise"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

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
  const { data, isLoading, error, refetch } = useExercise(eventId, open)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Responder exercício</DialogTitle>
          <DialogDescription>
            Visualize e responda as questões disponíveis para esta aula.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando questões...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="h-4 w-4" />
            {error.message}
          </div>
        )}

        {!isLoading && !error && data && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{data.exercise.name}</p>
                <p className="text-xs text-muted-foreground">
                  {data.answers_count}/{data.exercise.questions_count} questões respondidas
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">Evento #{data.event_id}</Badge>
                <Badge variant="outline">Aula #{data.lesson_id}</Badge>
                {data.score !== null && <Badge variant="default">Nota: {data.score}</Badge>}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {data.questions.map((question) => {
                const currentAnswer = selectedAnswers[question.id]
                const sentAnswer = answersMap[question.id]
                const isAnswered = Boolean(sentAnswer)

                return (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{question.name}</p>
                        {question.statement && (
                          <p className="text-xs text-muted-foreground mt-1">{question.statement}</p>
                        )}
                      </div>
                      {isAnswered && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Respondida ({sentAnswer})
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {answerOptions.map(({ key, label }) => (
                        <Button
                          key={key}
                          type="button"
                          variant={currentAnswer === label ? "default" : "outline"}
                          className="justify-start text-left"
                          onClick={() => handleSelectAnswer(question.id, label)}
                        >
                          <span className="mr-2 font-semibold">{label}.</span>
                          <span className="text-sm">{question[key]}</span>
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
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
                          "Enviar resposta"
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
