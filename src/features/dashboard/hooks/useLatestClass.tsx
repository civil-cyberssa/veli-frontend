'use client'

import { useSession } from 'next-auth/react'
import useSWR, { type KeyedMutator } from 'swr'

interface LanguageDetails {
  name?: string
  code?: string
  short_name?: string
  flag?: string
  flag_icon?: string
  icon?: string
}

export interface LatestClassEvent {
  event: {
    id: number
    scheduled_datetime: string
    classroom_link: string
    event_recorded_link: string
    class_notice: string
    lesson_content_url: string | null
    lesson: {
      id: number
      name: string
      lesson_type: string
      order: number
    }
    module: {
      id: number
      name: string
      order: number
      language?: LanguageDetails
      language_icon?: string
      language_flag?: string
      language_code?: string
    }
    language?: LanguageDetails
    language_icon?: string
    language_flag?: string
    language_code?: string
  }
  progress_id: number
  watched: boolean
  watched_at: string | null
  rating: number | null
  comment: string
  teatcher_answer: string
  teacher_answer?: string
  exercise_score: number
  exercise_id: number | null
}

export interface UseLatestClassReturn {
  data: LatestClassEvent | null
  isLoading: boolean
  error: Error | null
  refetch: KeyedMutator<LatestClassEvent>
}

const fetcher = async (url: string, token: string): Promise<LatestClassEvent | null> => {
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
    throw new Error(`Erro ao buscar última aula: ${response.status}`)
  }

  const data = await response.json()

  // Normalize teacher_answer field
  return {
    ...data,
    teacher_answer: data.teacher_answer ?? data.teatcher_answer ?? '',
  }
}

export function useLatestClass(courseId: string | null): UseLatestClassReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<LatestClassEvent | null>(
    status === 'authenticated' && session?.access && courseId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/event-progress/latest/${courseId}/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
    }
  )

  return {
    data: data || null,
    isLoading,
    error: error || null,
    refetch: mutate,
  }
}
