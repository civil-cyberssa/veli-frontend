'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface MarkLessonWatchedParams {
  eventId: number
  lessonId: number
}

interface UseMarkLessonWatchedReturn {
  markAsWatched: (params: MarkLessonWatchedParams) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useMarkLessonWatched(): UseMarkLessonWatchedReturn {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const markAsWatched = async ({ eventId, lessonId }: MarkLessonWatchedParams) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student-portal/event-progress/update/${eventId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            lesson_id: lessonId,
            watched: true,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao marcar aula como assistida: ${response.status}`)
      }

      // Success - pode retornar data se a API retornar algo útil
      return await response.json()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    markAsWatched,
    isLoading,
    error,
  }
}
