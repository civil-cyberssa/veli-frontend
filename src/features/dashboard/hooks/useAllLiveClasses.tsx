'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

import type { LiveClassEvent } from './useLiveClassList'
import type { Subscription } from './useSubscription'

export type AggregatedLiveClass = LiveClassEvent & {
  student_class_id: number
  course: Subscription
}

interface UseAllLiveClassesReturn {
  data: AggregatedLiveClass[] | null
  isLoading: boolean
  error: Error | null
}

const fetchLiveClasses = async (
  courseIds: number[],
  token: string,
  subscriptionMap: Map<number, Subscription>
): Promise<AggregatedLiveClass[]> => {
  const requests = courseIds.map(async (courseId) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/student-portal/event-progress/live/${courseId}/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      }
    )

    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      throw new Error(`Erro ao buscar aulas ao vivo: ${response.status}`)
    }

    const data = await response.json()

    const course = subscriptionMap.get(courseId)
    if (!course) return []

    return data.map((item: LiveClassEvent) => ({
      ...item,
      teacher_answer: item.teacher_answer ?? item.teatcher_answer ?? '',
      student_class_id: courseId,
      course,
    }))
  })

  const results = await Promise.all(requests)
  return results.flat()
}

export function useAllLiveClasses(
  subscriptions: Subscription[] | undefined
): UseAllLiveClassesReturn {
  const { data: session, status } = useSession()
  const subscriptionMap = useMemo(
    () =>
      new Map(
        (subscriptions || []).map((subscription) => [subscription.student_class_id, subscription])
      ),
    [subscriptions]
  )
  const courseIds = useMemo(
    () => (subscriptions || []).map((subscription) => subscription.student_class_id),
    [subscriptions]
  )

  const shouldFetch =
    status === 'authenticated' && Boolean(session?.access) && courseIds.length > 0

  const { data, error, isLoading } = useSWR<AggregatedLiveClass[]>(
    shouldFetch ? ['all-live-classes', courseIds, session!.access] : null,
    ([, ids, token]: [string, number[], string]) => fetchLiveClasses(ids, token, subscriptionMap),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
    }
  )

  return {
    data: data || null,
    isLoading,
    error: error || null,
  }
}
