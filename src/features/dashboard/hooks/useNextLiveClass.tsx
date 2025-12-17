'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export interface EventLesson {
  id: number
  name: string
  lesson_type: string
  order: number
}

export interface EventModule {
  id: number
  name: string
  order: number
}

export interface LiveEvent {
  id: number
  scheduled_datetime: string
  classroom_link: string
  event_recorded_link: string
  class_notice: string
  lesson_content_url: string | null
  lesson: EventLesson
  module: EventModule
}

export interface NextLiveClass {
  event: LiveEvent
  progress_id: number
  watched: boolean
  watched_at: string | null
  rating: number | null
  comment: string
  teatcher_answer: string
  exercise_score: number
  exercise_id: number | null
}

export interface UseNextLiveClassReturn {
  data: NextLiveClass | undefined
  loading: boolean
  error: Error | null
  mutate: () => void
}

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null // Nenhuma aula ao vivo agendada
    }
    throw new Error(`Erro ao buscar próxima aula ao vivo: ${response.status}`)
  }

  const data = await response.json()

  // Se retornar um array, pega o primeiro item (próxima aula)
  if (Array.isArray(data) && data.length > 0) {
    return data[0]
  }

  return data
}

export function useNextLiveClass(subscriptionId: number | null): UseNextLiveClassReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<NextLiveClass | null>(
    status === 'authenticated' && session?.access && subscriptionId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/subscriptions/${subscriptionId}/next-live/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minuto
    }
  )

  return {
    data: data || undefined,
    loading: isLoading,
    error: error || null,
    mutate,
  }
}
