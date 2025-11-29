export interface Exercise {
  id: number
  name: string
  questions_count: number
  answers_count: number
}

export interface LessonProgress {
  event_id: number
  lesson_id: number
  lesson_name: string
  module_id: number
  module_name: string
  scheduled_datetime: string
  watched: boolean
  watched_at: string | null
  rating: number | null
  comment: string
  exercise: Exercise | null
  exercise_score: number | null
}

export interface ModuleProgress {
  moduleId: number
  moduleName: string
  lessons: LessonProgress[]
  completedCount: number
  totalCount: number
  progressPercentage: number
}

export interface EventProgressData {
  modules: ModuleProgress[]
  totalLessons: number
  completedLessons: number
  overallProgress: number
}
