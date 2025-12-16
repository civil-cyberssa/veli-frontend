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
    answer: 'a' | 'b' | 'c' | 'd'
  ) => {
    if (!token) {
      throw new Error('Not authenticated')
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_URL}/student-portal/daily-activities/${courseId}/${activityId}/submit/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ answer }),
        }
      )

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
