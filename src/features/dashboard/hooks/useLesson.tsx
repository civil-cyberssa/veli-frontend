'use client'

import { useSession } from 'next-auth/react'
import useSWR from 'swr'

export interface Activity {
  id: number
  title: string
  description: string
  type: 'quiz' | 'assignment' | 'reading'
  completed: boolean
  score?: number
}

// Interface da API real
export interface LessonApiResponse {
  lesson_id: number
  lesson_name: string
  lesson_type: string
  order: number
  module: {
    id: number
    name: string
  }
  content_url: string
  support_material_url?: string
  exercise?: {
    id: number
    name: string
    questions_count: number
  }
  is_weekly: boolean
}

// Interface processada para uso na aplicação
export interface Lesson {
  id: number
  lesson_name: string
  lesson_type: string
  order: number
  module: {
    id: number
    name: string
  }
  content_url: string
  support_material_url?: string
  exercise?: {
    id: number
    name: string
    questions_count: number
  }
  is_weekly: boolean
  // Mock fields (serão implementados depois)
  rating: number | null
  comment: string
  activities: Activity[]
}

export interface UseLessonReturn {
  data: Lesson | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// Função para gerar atividades mock baseadas no exercício
const generateMockActivities = (
  exercise?: { id: number; name: string; questions_count: number },
  exerciseStatus?: { answers_count: number; score: number }
): Activity[] => {
  if (!exercise) return []

  const activities: Activity[] = []

  // Verificar se o quiz foi completado (todas as questões foram respondidas)
  const quizCompleted = exerciseStatus
    ? exerciseStatus.answers_count === exercise.questions_count
    : false

  // Adicionar material de leitura como primeira atividade
  activities.push({
    id: exercise.id * 100 + 1,
    title: 'Material de Apoio',
    description: 'Leia o material de apoio antes de fazer o exercício',
    type: 'reading',
    completed: false,
  })

  // Adicionar o exercício principal
  activities.push({
    id: exercise.id,
    title: exercise.name,
    description: `Exercício com ${exercise.questions_count} questões`,
    type: 'quiz',
    completed: quizCompleted,
    score: quizCompleted && exerciseStatus ? exerciseStatus.score : undefined,
  })

  // Adicionar atividade complementar
  activities.push({
    id: exercise.id * 100 + 2,
    title: 'Prática Adicional',
    description: 'Pratique o que aprendeu nesta aula',
    type: 'assignment',
    completed: false,
  })

  return activities
}

const fetcher = async (
  url: string,
  token: string,
  eventId?: number
): Promise<Lesson | null> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Erro ao buscar aula: ${response.status}`)
  }

  const data: LessonApiResponse = await response.json()

  // Buscar status do exercício se existir e se tivermos o event_id
  let exerciseStatus: { answers_count: number; score: number } | undefined

  if (data.exercise && eventId) {
    try {
      const exerciseResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student-portal/exercises/${eventId}/`,
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
      // Continuar sem o status do exercício
    }
  }

  // Processar dados e adicionar mocks
  return {
    id: data.lesson_id,
    lesson_name: data.lesson_name,
    lesson_type: data.lesson_type,
    order: data.order,
    module: data.module,
    content_url: data.content_url,
    support_material_url: data.support_material_url,
    exercise: data.exercise,
    is_weekly: data.is_weekly,
    // Mock data (será implementado depois via API)
    rating: null,
    comment: '',
    activities: generateMockActivities(data.exercise, exerciseStatus),
  }
}

export function useLesson(
  lessonId: string | null,
  eventId?: number
): UseLessonReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<Lesson | null>(
    status === 'authenticated' && session?.access && lessonId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/lessons/${lessonId}/`, session.access, eventId]
      : null,
    ([url, token, evtId]: [string, string, number | undefined]) => fetcher(url, token, evtId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minuto
    }
  )

  return {
    data: data || null,
    isLoading,
    error: error || null,
    refetch: mutate,
  }
}
