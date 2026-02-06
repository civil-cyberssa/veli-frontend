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
  activity_type: 'text' | 'video' | 'audio' | 'image' | 'file' | 'video_youtube'
  answer_a: string
  answer_b: string
  answer_c: string
  answer_d: string
  available_on: string
  answer_id?: number
  user_answer?: 'a' | 'b' | 'c' | 'd'
  is_correct?: boolean
  is_done: boolean
  file?: string | null
  video_yt_link?: string | null
  atvideo_yt_link?: string | null
}

export type DailyActivityDetail = DailyActivity

export interface DailyActivitiesSummary {
  month?: string
  total_activities?: number
  total_answered?: number
  total_correct?: number
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

export function useDailyActivitiesSummary(courseId: number | null) {
  const { data: session } = useSession()
  const token = session?.access

  const fetcher = async (url: string): Promise<DailyActivitiesSummary> => {
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
      throw new Error(`Erro ao buscar resumo de atividades: ${response.status}`)
    }

    return await response.json()
  }

  const { data, error, isLoading, mutate } = useSWR(
    courseId && token ? `${NEXT_PUBLIC_API_URL}/student-portal/daily-activities/${courseId}/summary/` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    summary: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useTodayDailyActivity(courseId: number | null) {
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
      throw new Error(`Erro ao buscar atividade de hoje: ${response.status}`)
    }

    return await response.json()
  }

  const { data, error, isLoading, mutate } = useSWR(
    courseId && token ? `${NEXT_PUBLIC_API_URL}/student-portal/daily-activities/${courseId}/today/` : null,
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
  userAnswer?: 'a' | 'b' | 'c' | 'd'
  fileAnswer?: File | null
}

export function useSubmitActivityAnswer() {
  const { data: session } = useSession()
  const token = session?.access

  const submitAnswer = async (
    url: string,
    { arg }: { arg: SubmitActivityAnswerParams }
  ): Promise<DailyActivityDetail> => {
    if (!token) throw new Error('Não autenticado')

    const endpoint = `${NEXT_PUBLIC_API_URL}/student-portal/daily-activities/${arg.courseId}/answers/`

    const fileAnswer = arg.fileAnswer
    const hasFile = fileAnswer instanceof File
    const payload = hasFile ? new FormData() : JSON.stringify({
      daily_activity: arg.activityId,
      user_answer: arg.userAnswer,
      file_answer: null,
    })

    if (fileAnswer instanceof File && payload instanceof FormData) {
      payload.append('daily_activity', String(arg.activityId))
      if (arg.userAnswer) payload.append('user_answer', arg.userAnswer)
      payload.append('file_answer', fileAnswer)
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: hasFile
        ? { 'Authorization': `Bearer ${token}` }
        : {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
      credentials: 'include',
      body: payload,
    })

    if (!response.ok) {
      throw new Error(`Erro ao submeter resposta: ${response.status}`)
    }

    return await response.json()
  }

  return useSWRMutation('/submit-activity-answer', submitAnswer)
}
