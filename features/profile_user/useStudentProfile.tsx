import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Language {
  id: number
  name: string
  lang_icon: string
  lang_description: string
}

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  cpf: string
  date_of_birth: string
  gender: string
  state: string
  city: string
  country: string
  phone: string
  role: string
  profile_pic_url: string
}

interface StudentProfile {
  id: number
  bio: string
  languages: Language[]
}

interface StudentData {
  user: User
  student_profile: StudentProfile
}

interface UseStudentProfileReturn {
  data: StudentData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStudentProfile(): UseStudentProfileReturn {
  const { data: session, status } = useSession()
  const [data, setData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStudentProfile = async () => {
    // Se não há sessão, não faz a requisição
    if (status !== 'authenticated' || !session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Monta os headers com autenticação
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Adiciona o token de autenticação se disponível
      if (session.access) {
        headers['Authorization'] = `Bearer ${session.access}`
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student-portal/student/`, {
        method: 'GET',
        headers,
        credentials: 'include', // Para enviar cookies se necessário
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar perfil: ${response.status}`)
      }

      const studentData: StudentData = await response.json()
      setData(studentData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'))
      console.error('Erro ao buscar perfil do estudante:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentProfile()
  }, [status, session])

  return {
    data,
    loading,
    error,
    refetch: fetchStudentProfile,
  }
}