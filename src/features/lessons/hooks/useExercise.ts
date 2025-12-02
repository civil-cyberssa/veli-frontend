"use client"

import { useSession } from "next-auth/react"
import useSWR from "swr"

export interface ExerciseQuestion {
  id: number
  name: string
  statement: string
  statement_type: string
  answer_a: string
  answer_b: string
  answer_c: string
  answer_d: string
}

export interface ExerciseAnswer {
  id: number
  question_id: number
  answer: string
  is_correct: boolean
  created_at: string
}

export interface ExerciseResponse {
  event_id: number
  lesson_id: number
  exercise: {
    id: number
    name: string
    questions_count: number
  }
  score: number | null
  answers_count: number
  answers: ExerciseAnswer[]
  questions: ExerciseQuestion[]
}

interface UseExerciseReturn {
  data: ExerciseResponse | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<ExerciseResponse | undefined>
}

const fetcher = async (url: string, token: string): Promise<ExerciseResponse> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar exercício: ${response.status}`)
  }

  return response.json()
}

export function useExercise(eventId: string | null, enabled = true): UseExerciseReturn {
  const { data: session, status } = useSession()

  const shouldFetch = Boolean(status === "authenticated" && session?.access && eventId && enabled)

  const { data, error, mutate, isLoading } = useSWR<ExerciseResponse>(
    shouldFetch
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/exercises/${eventId}/`, session!.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  )

  return {
    data: data || null,
    isLoading,
    error: error || null,
    refetch: mutate,
  }
}
