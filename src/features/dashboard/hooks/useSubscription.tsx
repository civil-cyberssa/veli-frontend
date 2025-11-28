'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

export interface Subscription {
  id: number
  status: string
  student_class_id: number
  student_class_name: string
  course_name: string
  course_icon: string
  created_at: string
  updated_at: string
}

export interface UseSubscriptionsReturn {
  data: Subscription[] | undefined
  loading: boolean
  error: Error | null
  mutate: () => void
  selectedSubscription: Subscription | null
  setSelectedSubscription: (subscription: Subscription | null) => void
  selectedId: number | null
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
    throw new Error(`Erro ao buscar inscrições: ${response.status}`)
  }

  return response.json()
}

export function useSubscriptions(): UseSubscriptionsReturn {
  const { data: session, status } = useSession()
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)

  const { data, error, mutate, isLoading } = useSWR<Subscription[]>(
    status === 'authenticated' && session?.access
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/subscriptions/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minuto
    }
  )

  // Seleciona automaticamente o primeiro curso quando os dados são carregados
  useEffect(() => {
    if (data && data.length > 0 && !selectedSubscription) {
      setSelectedSubscription(data[0])
    }
  }, [data, selectedSubscription])

  return {
    data,
    loading: isLoading,
    error: error || null,
    mutate,
    selectedSubscription,
    setSelectedSubscription,
    selectedId: selectedSubscription?.id || null,
  }
}