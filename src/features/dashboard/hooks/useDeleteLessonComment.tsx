'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface DeleteLessonCommentParams {
  commentId: number
}

interface UseDeleteLessonCommentReturn {
  deleteComment: (params: DeleteLessonCommentParams) => Promise<void>
  isLoading: boolean
  error: Error | null
}

export function useDeleteLessonComment(): UseDeleteLessonCommentReturn {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteComment = async ({ commentId }: DeleteLessonCommentParams) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-comments/${commentId}/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access}`,
          },
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ao excluir comentário: ${response.status}`)
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
    deleteComment,
    isLoading,
    error,
  }
}
