'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

export function useSubmitActivityAnswer() {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = session?.access

  const submitAnswer = async (
    courseId: number,
    activityId: number,
    userAnswer?: 'a' | 'b' | 'c' | 'd',
    fileAnswer?: File | null
  ) => {
    if (!token) {
      throw new Error('Not authenticated')
    }

    setIsSubmitting(true)

    try {
      const endpoint = `${NEXT_PUBLIC_API_URL}/student-portal/daily-activities/${courseId}/answers/`
      const hasFile = fileAnswer instanceof File

      const payload = hasFile ? new FormData() : JSON.stringify({
        daily_activity: activityId,
        user_answer: userAnswer,
        file_answer: null,
      })

      if (hasFile && payload instanceof FormData) {
        payload.append('daily_activity', String(activityId))
        if (userAnswer) payload.append('user_answer', userAnswer)
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
        throw new Error(`Erro ao enviar resposta: ${response.status}`)
      }

      return await response.json()
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submitAnswer, isSubmitting }
}
