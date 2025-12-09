'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

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

export interface CreateCommentData {
  lesson_id: number
  comment: string
}

export interface UpdateCommentData {
  comment: string
}

export interface UseLessonCommentsReturn {
  data: LessonCommentsResponse | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
  createComment: (data: CreateCommentData) => Promise<any>
  isCreating: boolean
  updateComment: (commentId: number, data: UpdateCommentData) => Promise<any>
  isUpdating: boolean
  deleteComment: (commentId: number) => Promise<any>
  isDeleting: boolean
}

// Fetcher para GET
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

// Função para criar comentário (POST)
async function createComment(
  url: string,
  { arg }: { arg: { token: string; data: CreateCommentData } }
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${arg.token}`,
    },
    credentials: 'include',
    body: JSON.stringify(arg.data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao criar comentário: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

// Função para atualizar comentário (PATCH)
async function updateComment(
  url: string,
  { arg }: { arg: { token: string; commentId: number; data: UpdateCommentData } }
) {
  const response = await fetch(`${url}${arg.commentId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${arg.token}`,
    },
    credentials: 'include',
    body: JSON.stringify(arg.data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao atualizar comentário: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

// Função para deletar comentário (DELETE)
async function deleteComment(
  url: string,
  { arg }: { arg: { token: string; commentId: number } }
) {
  const response = await fetch(`${url}${arg.commentId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${arg.token}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao deletar comentário: ${response.status} - ${errorText}`)
  }

  // DELETE geralmente retorna 204 No Content
  if (response.status === 204) {
    return { success: true }
  }

  return await response.json()
}

export function useLessonComments(
  lessonId: number | null,
  pageSize: number = 10
): UseLessonCommentsReturn {
  const { data: session, status } = useSession()
  
  // URL base: /student-portal/lessons/{lessonId}/comments/
  const baseUrl = lessonId 
    ? `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lessons/${lessonId}/comments/`
    : null

  // GET - Listar comentários
  const { data, error, mutate, isLoading } = useSWR<LessonCommentsResponse>(
    status === 'authenticated' && session?.access && baseUrl
      ? [`${baseUrl}?page_size=${pageSize}`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
    }
  )

  // POST - Criar comentário
  const { trigger: create, isMutating: isCreating } = useSWRMutation(
    baseUrl,
    createComment,
    {
      onSuccess: () => {
        mutate()
      },
      onError: (error) => {
        console.error('Erro ao criar comentário:', error)
      }
    }
  )

  // PATCH - Atualizar comentário
  const { trigger: update, isMutating: isUpdating } = useSWRMutation(
    baseUrl,
    updateComment,
    {
      onSuccess: () => {
        mutate()
      },
      onError: (error) => {
        console.error('Erro ao atualizar comentário:', error)
      }
    }
  )

  // DELETE - Deletar comentário
  const { trigger: remove, isMutating: isDeleting } = useSWRMutation(
    baseUrl,
    deleteComment,
    {
      onSuccess: () => {
        mutate()
      },
      onError: (error) => {
        console.error('Erro ao deletar comentário:', error)
      }
    }
  )

  // Wrappers para facilitar o uso
  const createCommentAction = async (commentData: CreateCommentData) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }
    if (!baseUrl) {
      throw new Error('Lesson ID não fornecido')
    }
    
    try {
      const result = await create({ token: session.access, data: commentData })
      return result
    } catch (error) {
      console.error('Erro na criação do comentário:', error)
      throw error
    }
  }

  const updateCommentAction = async (
    commentId: number,
    commentData: UpdateCommentData
  ) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }
    if (!baseUrl) {
      throw new Error('Lesson ID não fornecido')
    }
    
    try {
      const result = await update({ token: session.access, commentId, data: commentData })
      return result
    } catch (error) {
      console.error('Erro na atualização do comentário:', error)
      throw error
    }
  }

  const deleteCommentAction = async (commentId: number) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }
    if (!baseUrl) {
      throw new Error('Lesson ID não fornecido')
    }
    
    try {
      const result = await remove({ token: session.access, commentId })
      return result
    } catch (error) {
      console.error('Erro na exclusão do comentário:', error)
      throw error
    }
  }

  return {
    // GET
    data: data || null,
    isLoading,
    error: error || null,
    refetch: mutate,
    
    // POST
    createComment: createCommentAction,
    isCreating,
    
    // PATCH
    updateComment: updateCommentAction,
    isUpdating,
    
    // DELETE
    deleteComment: deleteCommentAction,
    isDeleting,
  }
}
