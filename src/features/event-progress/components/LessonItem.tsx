'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Clock, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { LessonProgress } from '../types'

interface LessonItemProps {
  lesson: LessonProgress
  index: number
}

export function LessonItem({ lesson, index }: LessonItemProps) {
  const formattedDate = format(
    new Date(lesson.scheduled_datetime),
    "dd/MM/yyyy - HH:mm",
    { locale: ptBR }
  )

  const hasExercise = lesson.exercise !== null
  const exerciseProgress = hasExercise
    ? `${lesson.exercise!.answers_count}/${lesson.exercise!.questions_count}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-1">
          {lesson.watched ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Clock className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            {lesson.lesson_name}
          </h4>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                lesson.watched
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {lesson.watched ? 'Assistida' : 'Pendente'}
            </span>

            {lesson.watched && lesson.rating && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < lesson.rating! ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Exercise Button */}
        {hasExercise && (
          <div className="flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium text-sm hover:bg-purple-100 transition-colors">
              <FileText className="w-4 h-4" />
              <span>Ver exercício</span>
              {exerciseProgress && (
                <span className="text-xs opacity-75">
                  ({exerciseProgress})
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Exercise Score Indicator */}
      {hasExercise && lesson.exercise_score !== null && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pontuação do exercício:</span>
            <span className="font-semibold text-purple-700">
              {lesson.exercise_score} / {lesson.exercise!.questions_count}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
