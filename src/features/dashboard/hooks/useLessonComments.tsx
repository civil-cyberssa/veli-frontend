'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export interface LessonComment {
  id: number
  lesson_id: number
  user_id: number
  user_name: string
  comment: string
  created_at: string
  current_user: boolean
  profile_pic_url: string
}

export interface LessonCommentsResponse {
  count: number
  next: string | null
  previous: string | null
  results: LessonComment[]
}

export interface UseLessonCommentsReturn {
  data: LessonCommentsResponse | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const fetcher = async (
  url: string,
  token: string
): Promise<LessonCommentsResponse> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar comentários: ${response.status}`)
  }

  return await response.json()
}

export function useLessonComments(
  lessonId: number | null,
  pageSize: number = 10
): UseLessonCommentsReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<LessonCommentsResponse>(
    status === 'authenticated' && session?.access && lessonId
      ? [
          `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lessons/${lessonId}/comments/?page_size=${pageSize}`,
          session.access,
        ]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
    }
  )

  return {
    data: data || null,
    isLoading,
    error: error || null,
    refetch: mutate,
  }
}
