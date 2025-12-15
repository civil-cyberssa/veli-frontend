'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

export interface DoubtAnswer {
  id: number
  comment: string
  teacher_profile: number
  teacher_name: string
  created_at: string
  updated_at: string
}

export interface LessonDoubt {
  id: number
  lesson: number
  lesson_name: string
  registration_id: number
  comment: string
  created_at: string
  updated_at: string
  doubt_answers: DoubtAnswer[]
}

interface CreateDoubtPayload {
  registration: number
  lesson: number
  comment: string
}

interface UpdateDoubtPayload {
  comment: string
}

// Fetcher para GET
const fetcher = async (
  url: string,
  token: string
): Promise<LessonDoubt[]> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Erro ao buscar dúvidas: ${response.status}`)
  }

  return await response.json()
}

// Função para criar dúvida (POST)
async function createDoubt(
  url: string,
  { arg }: { arg: { token: string; data: CreateDoubtPayload } }
): Promise<LessonDoubt> {
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
    throw new Error(`Erro ao criar dúvida: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

// Função para atualizar dúvida (PUT)
async function updateDoubt(
  url: string,
  { arg }: { arg: { token: string; registrationId: number; doubtId: number; data: UpdateDoubtPayload } }
): Promise<LessonDoubt> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-doubts/${arg.registrationId}/${arg.doubtId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${arg.token}`,
      },
      credentials: 'include',
      body: JSON.stringify(arg.data),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao atualizar dúvida: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

// Função para deletar dúvida (DELETE)
async function deleteDoubt(
  url: string,
  { arg }: { arg: { token: string; registrationId: number; doubtId: number } }
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-doubts/${arg.registrationId}/${arg.doubtId}/`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${arg.token}`,
      },
      credentials: 'include',
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao deletar dúvida: ${response.status} - ${errorText}`)
  }

  return { success: true }
}

// Hook para listar dúvidas de uma aula
export function useLessonDoubts(registrationId?: number, lessonId?: number) {
  const { data: session, status } = useSession()

  const baseUrl =
    registrationId && lessonId
      ? `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-doubts/${registrationId}/lessons/${lessonId}/`
      : null

  const { data, error, mutate, isLoading } = useSWR<LessonDoubt[]>(
    status === 'authenticated' && session?.access && baseUrl
      ? [baseUrl, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
    }
  )

  return {
    data: data || [],
    error,
    isLoading,
    mutate,
  }
}

// Hook para criar dúvida
export function useCreateDoubt() {
  const { data: session } = useSession()
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-doubts/`

  const { trigger, isMutating } = useSWRMutation(
    baseUrl,
    createDoubt,
    {
      onError: (error) => {
        console.error('Erro ao criar dúvida:', error)
      }
    }
  )

  const mutateAsync = async (data: CreateDoubtPayload) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    return await trigger({ token: session.access, data })
  }

  return {
    mutateAsync,
    isPending: isMutating,
  }
}

// Hook para atualizar dúvida
export function useUpdateDoubt() {
  const { data: session } = useSession()
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-doubts/`

  const { trigger, isMutating } = useSWRMutation(
    baseUrl,
    updateDoubt,
    {
      onError: (error) => {
        console.error('Erro ao atualizar dúvida:', error)
      }
    }
  )

  const mutateAsync = async ({
    registrationId,
    doubtId,
    payload,
  }: {
    registrationId: number
    doubtId: number
    payload: UpdateDoubtPayload
  }) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    return await trigger({
      token: session.access,
      registrationId,
      doubtId,
      data: payload,
    })
  }

  return {
    mutateAsync,
    isPending: isMutating,
  }
}

// Hook para deletar dúvida
export function useDeleteDoubt() {
  const { data: session } = useSession()
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lesson-doubts/`

  const { trigger, isMutating } = useSWRMutation(
    baseUrl,
    deleteDoubt,
    {
      onError: (error) => {
        console.error('Erro ao deletar dúvida:', error)
      }
    }
  )

  const mutateAsync = async ({
    registrationId,
    doubtId,
  }: {
    registrationId: number
    doubtId: number
  }) => {
    if (!session?.access) {
      throw new Error('Usuário não autenticado')
    }

    return await trigger({
      token: session.access,
      registrationId,
      doubtId,
    })
  }

  return {
    mutateAsync,
    isPending: isMutating,
  }
}
