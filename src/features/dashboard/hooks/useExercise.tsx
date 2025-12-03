'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export interface Question {
  id: number
  name: string
  statement: string
  statement_type: 'text' | 'image' | 'audio' | 'video'
  answer_a: string
  answer_b: string
  answer_c: string
  answer_d: string
  correct_answer?: 'A' | 'B' | 'C' | 'D' // Só vem depois de responder
}

export interface Answer {
  id: number
  question_id: number
  answer: 'A' | 'B' | 'C' | 'D'
  is_correct: boolean
  created_at: string
}

export interface ExerciseData {
  event_id: number
  lesson_id: number
  exercise: {
    id: number
    name: string
    questions_count: number
  }
  score: number
  answers_count: number
  answers: Answer[]
  questions: Question[]
}

export interface UseExerciseReturn {
  data: ExerciseData | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const fetcher = async (url: string, token: string): Promise<ExerciseData | null> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Erro ao buscar exercício: ${response.status}`)
  }

  const data: ExerciseData = await response.json()
  return data
}

export function useExercise(eventId: number | null): UseExerciseReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<ExerciseData | null>(
    status === 'authenticated' && session?.access && eventId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/exercises/${eventId}/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minuto
    }
  )

  return {
    data: data || null,
    isLoading,
    error: error || null,
    refetch: mutate,
  }
}
