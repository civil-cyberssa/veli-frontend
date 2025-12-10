'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface UpdateLessonCommentParams {
  commentId: number
  comment: string
}

interface UseUpdateLessonCommentReturn {
  updateComment: (params: UpdateLessonCommentParams) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useUpdateLessonComment(): UseUpdateLessonCommentReturn {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateComment = async ({ commentId, comment }: UpdateLessonCommentParams) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-comments/${commentId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access}`,
          },
          credentials: 'include',
          body: JSON.stringify({ comment }),
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao atualizar comentário: ${response.status}`)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateComment,
    isLoading,
    error,
  }
}
