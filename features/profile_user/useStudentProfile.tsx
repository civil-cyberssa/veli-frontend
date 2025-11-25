import { useSession } from 'next-auth/react'
import useSWR from 'swr'

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
  data: StudentData | undefined
  loading: boolean
  error: Error | null
  mutate: () => void
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
    throw new Error(`Erro ao buscar perfil: ${response.status}`)
  }

  return response.json()
}

export function useStudentProfile(): UseStudentProfileReturn {
  const { data: session, status } = useSession()

  const { data, error, mutate, isLoading } = useSWR<StudentData>(
    status === 'authenticated' && session?.access
      ? [`${process.env.NEXT_PUBLIC_API_URL}/student-portal/student/`, session.access]
      : null,
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minuto
    }
  )

  return {
    data,
    loading: isLoading,
    error: error || null,
    mutate,
  }
}
