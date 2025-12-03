'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface SubmitAnswerParams {
  subscriptionId: number
  exerciseId: number
  questionId: number
  eventId: number
  answer: 'A' | 'B' | 'C' | 'D'
}

interface SubmitAnswerResponse {
  id: number
  subscription: number
  exercise: number
  question: number
  event: number
  answer: string
  is_correct: boolean
  created_at: string
  correct_answer?: string
}

interface UseSubmitAnswerReturn {
  submitAnswer: (params: SubmitAnswerParams) => Promise<SubmitAnswerResponse>
  isLoading: boolean
  error: Error | null
}

export function useSubmitAnswer(): UseSubmitAnswerReturn {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const submitAnswer = async ({
    subscriptionId,
    exerciseId,
    questionId,
    eventId,
    answer
  }: SubmitAnswerParams): Promise<SubmitAnswerResponse> => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student-portal/exercise-answers/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            subscription: subscriptionId,
            exercise: exerciseId,
            question: questionId,
            event: eventId,
            answer,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao enviar resposta: ${response.status}`)
      }

      const data: SubmitAnswerResponse = await response.json()
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    submitAnswer,
    isLoading,
    error,
  }
}
