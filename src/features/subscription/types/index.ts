export interface Course {
  id: number
  name: string
  description: string
  language: string
  level: string
  course_icon?: string
}

export interface Subscription {
  id: number
  course: Course
  enrollment_date: string
  status: string
  is_active: boolean
}

export interface UseSubscriptionReturn {
  subscriptions: Subscription[] | undefined
  loading: boolean
  error: Error | null
  mutate: () => void
}
