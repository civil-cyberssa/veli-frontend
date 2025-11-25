export interface Language {
  id: number
  name: string
  lang_icon: string
  lang_description: string
}

export interface User {
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

export interface StudentProfile {
  id: number
  bio: string
  languages: Language[]
}

export interface StudentData {
  user: User
  student_profile: StudentProfile
}

export interface UseStudentProfileReturn {
  data: StudentData | undefined
  loading: boolean
  error: Error | null
  mutate: () => void
}

export interface ProfileFormData {
  first_name: string
  last_name: string
  email: string
  username: string
  cpf: string
  date_of_birth: string
  gender: string
  phone: string
  cep: string
  country: string
  state: string
  city: string
  bio: string
}
