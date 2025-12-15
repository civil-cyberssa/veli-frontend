import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/src/services/api'

export interface DoubtAnswer {
  id: number
  comment: string
  teacher_profile: number
  teacher_name: string
  created_at: string
  updated_at: string
}

export interface LessonDoubt {
  id: number
  lesson: number
  lesson_name: string
  registration_id: number
  comment: string
  created_at: string
  updated_at: string
  doubt_answers: DoubtAnswer[]
}

interface CreateDoubtPayload {
  registration: number
  lesson: number
  comment: string
}

interface UpdateDoubtPayload {
  comment: string
}

// Hook para listar dúvidas de uma aula
export function useLessonDoubts(registrationId?: number, lessonId?: number) {
  return useQuery<LessonDoubt[]>({
    queryKey: ['lesson-doubts', registrationId, lessonId],
    queryFn: async () => {
      if (!registrationId || !lessonId) return []
      const { data } = await api.get(
        `/student-portal/lesson-doubts/${registrationId}/lessons/${lessonId}/`
      )
      return data
    },
    enabled: !!registrationId && !!lessonId,
  })
}

// Hook para criar dúvida
export function useCreateDoubt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateDoubtPayload) => {
      const { data } = await api.post('/student-portal/lesson-doubts/', payload)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lesson-doubts', variables.registration, variables.lesson],
      })
    },
  })
}

// Hook para editar dúvida
export function useUpdateDoubt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      registrationId,
      doubtId,
      payload,
    }: {
      registrationId: number
      doubtId: number
      payload: UpdateDoubtPayload
    }) => {
      const { data } = await api.put(
        `/student-portal/lesson-doubts/${registrationId}/${doubtId}/`,
        payload
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lesson-doubts'],
      })
    },
  })
}

// Hook para deletar dúvida
export function useDeleteDoubt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      registrationId,
      doubtId,
    }: {
      registrationId: number
      doubtId: number
    }) => {
      await api.delete(
        `/student-portal/lesson-doubts/${registrationId}/${doubtId}/`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['lesson-doubts'],
      })
    },
  })
}
