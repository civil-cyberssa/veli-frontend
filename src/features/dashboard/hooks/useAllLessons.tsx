'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { Lesson, LessonApiResponse } from './useLesson'

export interface UseAllLessonsReturn {
  lessons: Map<number, Lesson> | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const fetcher = async (
  url: string,
  token: string,
  eventProgressUrl: string
): Promise<Map<number, Lesson>> => {
  // Buscar o progresso dos eventos para obter todos os lesson_ids
  const progressResponse = await fetch(eventProgressUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (!progressResponse.ok) {
    throw new Error(`Erro ao buscar progresso: ${progressResponse.status}`)
  }

  const progressData = await progressResponse.json()

  // Criar um Map para armazenar as lições
  const lessonsMap = new Map<number, Lesson>()

  // Buscar cada lição em paralelo
  await Promise.all(
    progressData.map(async (progress: any) => {
      try {
        const lessonUrl = `${process.env.NEXT_PUBLIC_API_URL}/student-portal/lessons/${progress.lesson_id}/`
        const response = await fetch(lessonUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data: LessonApiResponse = await response.json()

          // Buscar status do exercício se existir
          let exerciseStatus: { answers_count: number; score: number } | undefined

          if (data.exercise && progress.event_id) {
            try {
              const exerciseResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/student-portal/exercises/${progress.event_id}/`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  credentials: 'include',
                }
              )

              if (exerciseResponse.ok) {
                const exerciseData = await exerciseResponse.json()
                exerciseStatus = {
                  answers_count: exerciseData.answers_count,
                  score: exerciseData.score,
                }
              }
            } catch (err) {
              console.error('Erro ao buscar status do exercício:', err)
            }
          }

          // Processar dados e adicionar ao Map
          const lesson: Lesson = {
            id: data.lesson_id,
            lesson_name: data.lesson_name,
            description: data.description,
            lesson_type: data.lesson_type,
            order: data.order,
            module: data.module,
            content_url: data.content_url,
            support_material_url: data.support_material_url,
            exercise: data.exercise,
            is_weekly: data.is_weekly,
            rating: null,
            comment: '',
            activities: [],
          }

          lessonsMap.set(progress.lesson_id, lesson)
        }
      } catch (err) {
        console.error(`Erro ao buscar lição ${progress.lesson_id}:`, err)
      }
    })
  )

  return lessonsMap
}

export function useAllLessons(courseId: string | null): UseAllLessonsReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<Map<number, Lesson>>(
    status === 'authenticated' && session?.access && courseId
      ? [
          `all-lessons-${courseId}`,
          session.access,
          `${process.env.NEXT_PUBLIC_API_URL}/student-portal/event-progress/${courseId}/`,
        ]
      : null,
    ([_, token, eventProgressUrl]: [string, string, string]) =>
      fetcher('', token, eventProgressUrl),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // Cache por 1 minuto
    }
  )

  return {
    lessons: data || null,
    isLoading,
    error: error || null,
    refetch: mutate,
  }
}
