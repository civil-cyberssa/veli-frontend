'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import type { Subscription, UseSubscriptionReturn } from '../types'

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
    throw new Error(`Erro ao buscar matrículas: ${response.status}`)
  }

  return response.json()
}

export function useSubscription(): UseSubscriptionReturn {
  const { data: session, status } = useSession()

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

  return {
    subscriptions: data,
    loading: isLoading,
    error: error || null,
    mutate,
  }
}
