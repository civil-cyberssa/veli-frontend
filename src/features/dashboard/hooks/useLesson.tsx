'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { useSubscriptions } from './useSubscription'

export interface Activity {
  id: number
  title: string
  description: string
  type: 'quiz' | 'assignment' | 'reading'
  completed: boolean
  score?: number
}

export interface Lesson {
  id: number
  lesson_name: string
  module_id: number
  module_name: string
  course_name: string
  video_url: string
  description?: string
  rating: number | null
  comment: string
  watched: boolean
  activities: Activity[]
}

export interface UseLessonReturn {
  data: Lesson | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const fetcher = async (url: string, token: string): Promise<Lesson | null> => {
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
    throw new Error(`Erro ao buscar aula: ${response.status}`)
  }

  return response.json()
}

export function useLesson(lessonId: string | null): UseLessonReturn {
  const { data: session, status } = useSession()
  const { selectedId } = useSubscriptions()

  const { data, error, mutate, isLoading } = useSWR<Lesson | null>(
    status === 'authenticated' && session?.access && selectedId && lessonId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/subscriptions/${selectedId}/lessons/${lessonId}/`, session.access]
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
