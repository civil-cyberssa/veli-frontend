'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export interface LessonProgress {
  event_id: number
  lesson_id: number
  lesson_name: string
  module_id: number
  module_name: string
  scheduled_datetime: string
  watched: boolean
  watched_at: string | null
  rating: number | null
  comment: string
  exercise: {
    id: number
    name: string
    questions_count: number
    answers_count: number
  } | null
  exercise_score: number | null
}

export interface UseEventProgressReturn {
  data: LessonProgress[] | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const fetcher = async (url: string, token: string): Promise<LessonProgress[]> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (response.status === 404) {
    return []
  }

  if (!response.ok) {
    throw new Error(`Erro ao buscar progresso: ${response.status}`)
  }

  return response.json()
}

export function useEventProgress(eventId: string | null): UseEventProgressReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<LessonProgress[]>(
    status === 'authenticated' && session?.access && eventId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/event-progress/${eventId}/`, session.access]
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
