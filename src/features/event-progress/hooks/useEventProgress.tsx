'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { LessonProgress, ModuleProgress, EventProgressData } from '../types'

export interface UseEventProgressReturn {
  data: EventProgressData | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
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
    throw new Error(`Erro ao buscar progresso do evento: ${response.status}`)
  }

  return response.json()
}

const transformData = (lessons: LessonProgress[]): EventProgressData => {
  // Agrupar lições por módulo
  const modulesMap = new Map<number, ModuleProgress>()

  lessons.forEach((lesson) => {
    if (!modulesMap.has(lesson.module_id)) {
      modulesMap.set(lesson.module_id, {
        moduleId: lesson.module_id,
        moduleName: lesson.module_name,
        lessons: [],
        completedCount: 0,
        totalCount: 0,
        progressPercentage: 0,
      })
    }

    const currentModule = modulesMap.get(lesson.module_id)!
    currentModule.lessons.push(lesson)
    currentModule.totalCount++
    if (lesson.watched) {
      currentModule.completedCount++
    }
  })

  // Calcular porcentagem de progresso de cada módulo
  const modules = Array.from(modulesMap.values()).map((module) => ({
    ...module,
    progressPercentage: module.totalCount > 0
      ? Math.round((module.completedCount / module.totalCount) * 100)
      : 0,
  }))

  // Calcular progresso geral
  const totalLessons = lessons.length
  const completedLessons = lessons.filter((l) => l.watched).length
  const overallProgress = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  return {
    modules,
    totalLessons,
    completedLessons,
    overallProgress,
  }
}

export function useEventProgress(eventId: number | null): UseEventProgressReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<LessonProgress[]>(
    status === 'authenticated' && session?.access && eventId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/event-progress/${eventId}/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
    }
  )

  const transformedData = data ? transformData(data) : undefined

  return {
    data: transformedData,
    isLoading,
    error: error || null,
    refetch: mutate,
  }
}
