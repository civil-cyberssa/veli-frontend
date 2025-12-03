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
const generateMockActivities = (exercise?: { id: number; name: string; questions_count: number }): Activity[] => {
  if (!exercise) return []

  const activities: Activity[] = []

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
    completed: false,
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

const fetcher = async (url: string, token: string): Promise<Lesson | null> => {
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
    activities: generateMockActivities(data.exercise),
  }
}

export function useLesson(lessonId: string | null): UseLessonReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<Lesson | null>(
    status === 'authenticated' && session?.access && lessonId
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/lessons/${lessonId}/`, session.access]
      : null,
    ([url, token]: [string, string]) => fetcher(url, token),
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
