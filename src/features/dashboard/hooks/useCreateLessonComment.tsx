'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface CreateLessonCommentParams {
  lessonId: number
  comment: string
}

interface UseCreateLessonCommentReturn {
  createComment: (params: CreateLessonCommentParams) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useCreateLessonComment(): UseCreateLessonCommentReturn {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createComment = async ({ lessonId, comment }: CreateLessonCommentParams) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    setIsLoading(true)
    setError(null)

    try {
      const body = {
        lesson_id: lessonId,
        comment: comment,
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-comments/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access}`,
          },
          credentials: 'include',
          body: JSON.stringify(body),
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao criar comentário: ${response.status}`)
      }

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
    createComment,
    isLoading,
    error,
  }
}
