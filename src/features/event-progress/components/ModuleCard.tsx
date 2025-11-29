'use client'

import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import { ModuleProgress } from '../types'
import { LessonItem } from './LessonItem'

interface ModuleCardProps {
  module: ModuleProgress
  index: number
}

export function ModuleCard({ module, index }: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-sm"
    >
      {/* Module Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {module.moduleName}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {module.completedCount} de {module.totalCount} aulas concluídas
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-purple-700" />
            <span className="text-sm font-semibold text-purple-700">
              {module.progressPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${module.progressPercentage}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
          />
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-3">
        {module.lessons.map((lesson, lessonIndex) => (
          <LessonItem
            key={lesson.lesson_id}
            lesson={lesson}
            index={lessonIndex}
          />
        ))}
      </div>
    </motion.div>
  )
}
