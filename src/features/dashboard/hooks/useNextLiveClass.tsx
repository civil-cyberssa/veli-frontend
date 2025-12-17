'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export interface NextLiveClass {
  event_id: number
  lesson_id: number
  lesson_name: string
  module_id: number
  module_name: string
  scheduled_datetime: string
  student_class_id: number
  course_name: string
  classroom_link: string
}

export interface UseNextLiveClassReturn {
  data: NextLiveClass | undefined
  loading: boolean
  error: Error | null
  mutate: () => void
}

const fetcher = async (url: string, token: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null // Nenhuma aula ao vivo agendada
    }
    throw new Error(`Erro ao buscar próxima aula ao vivo: ${response.status}`)
  }

  const data = await response.json()

  // Se retornar um array, pega o primeiro item (próxima aula)
  if (Array.isArray(data) && data.length > 0) {
    return data[0]
  }

  return data
}

export function useNextLiveClass(subscriptionId: number | null): UseNextLiveClassReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<NextLiveClass | null>(
    status === 'authenticated' && session?.access && subscriptionId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/subscriptions/${subscriptionId}/next-live/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minuto
    }
  )

  return {
    data: data || undefined,
    loading: isLoading,
    error: error || null,
    mutate,
  }
}
