'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { useSession } from 'next-auth/react'

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

export interface DailyActivity {
  id: number
  name: string
  statement: string
  category: 'culture' | 'sport' | 'education' | 'other'
  activity_type: 'text' | 'video' | 'audio' | 'image'
  answer_a: string
  answer_b: string
  answer_c: string
  answer_d: string
  available_on: string
  answer_id?: number
  user_answer?: 'a' | 'b' | 'c' | 'd'
  is_correct?: boolean
  is_done: boolean
}

export interface DailyActivityDetail extends DailyActivity {
  // O detalhe pode ter informações adicionais no futuro
}

// Hook para listar atividades de um curso
export function useDailyActivities(courseId: number | null) {
  const { data: session } = useSession()
  const token = session?.access

  const fetcher = async (url: string): Promise<DailyActivity[]> => {
    if (!token) throw new Error('Não autenticado')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar atividades: ${response.status}`)
    }

    return await response.json()
  }

  const { data, error, isLoading, mutate } = useSWR(
    courseId && token ? `${NEXT_PUBLIC_API_URL}/student-portal/daily-activities/${courseId}/month/` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    activities: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook para buscar detalhes de uma atividade específica
export function useDailyActivity(courseId: number | null, activityId: number | null) {
  const { data: session } = useSession()
  const token = session?.access

  const fetcher = async (url: string): Promise<DailyActivityDetail> => {
    if (!token) throw new Error('Não autenticado')

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar atividade: ${response.status}`)
    }

    return await response.json()
  }

  const { data, error, isLoading, mutate } = useSWR(
    courseId && activityId && token
      ? `${NEXT_PUBLIC_API_URL}/student-portal/daily-activities/${courseId}/${activityId}/`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    activity: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook para submeter resposta de uma atividade
interface SubmitActivityAnswerParams {
  courseId: number
  activityId: number
  answer: 'a' | 'b' | 'c' | 'd'
}

export function useSubmitActivityAnswer() {
  const { data: session } = useSession()
  const token = session?.access

  const submitAnswer = async (
    url: string,
    { arg }: { arg: SubmitActivityAnswerParams }
  ): Promise<DailyActivityDetail> => {
    if (!token) throw new Error('Não autenticado')

    const response = await fetch(
      `${NEXT_PUBLIC_API_URL}/student-portal/daily-activities/${arg.courseId}/${arg.activityId}/submit/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ answer: arg.answer }),
      }
    )

    if (!response.ok) {
      throw new Error(`Erro ao submeter resposta: ${response.status}`)
    }

    return await response.json()
  }

  return useSWRMutation('/submit-activity-answer', submitAnswer)
}
