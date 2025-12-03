'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface UpdateLessonRatingParams {
  eventId: number
  lessonId: number
  rating?: number | null
  comment?: string
}

interface UseUpdateLessonRatingReturn {
  updateRating: (params: UpdateLessonRatingParams) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useUpdateLessonRating(): UseUpdateLessonRatingReturn {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateRating = async ({ eventId, lessonId, rating, comment }: UpdateLessonRatingParams) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    setIsLoading(true)
    setError(null)

    try {
      const body: any = {}

      if (rating !== undefined) {
        body.rating = rating
      }

      if (comment !== undefined) {
        body.comment = comment
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student-portal/event-progress/${eventId}/lessons/${lessonId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access}`,
          },
          credentials: 'include',
          body: JSON.stringify(body),
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao atualizar avaliação: ${response.status}`)
      }

      // Success - retornar data se a API retornar algo útil
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
    updateRating,
    isLoading,
    error,
  }
}
