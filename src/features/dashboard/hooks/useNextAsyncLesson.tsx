'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export interface NextAsyncLesson {
  event_id: number
  lesson_id: number
  lesson_name: string
  module_id: number
  module_name: string
  scheduled_datetime: string
  student_class_id: number
  course_name: string
  exercise_score: number | null
  watched: boolean
  watched_at: string | null
  rating: number | null
  comment: string
  video_url: string
}

export interface UseNextAsyncLessonReturn {
  data: NextAsyncLesson | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const fetcher = async (url: string, token: string): Promise<NextAsyncLesson | null> => {
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
    throw new Error(`Erro ao buscar próxima aula: ${response.status}`)
  }

  return response.json()
}

export function useNextAsyncLesson(subscriptionId: number | null): UseNextAsyncLessonReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<NextAsyncLesson | null>(
    status === 'authenticated' && session?.access && subscriptionId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/subscriptions/${subscriptionId}/next-async/`, session.access]
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
