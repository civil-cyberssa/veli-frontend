'use client'

import { motion } from 'framer-motion'
import { TrendingUp, BookOpen, CheckCircle2, Trophy } from 'lucide-react'
import { EventProgressData } from '../types'

interface ProgressSidebarProps {
  data: EventProgressData
}

export function ProgressSidebar({ data }: ProgressSidebarProps) {
  const { overallProgress, completedLessons, totalLessons, modules } = data

  const completedModules = modules.filter(m => m.progressPercentage === 100).length
  const totalModules = modules.length

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-6 space-y-4"
    >
      {/* Overall Progress Card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Progresso Geral</h3>
            <p className="text-sm text-purple-100">Seu desempenho</p>
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/20"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallProgress / 100)}`}
                className="text-white transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">{overallProgress}%</div>
                <div className="text-xs text-purple-100">completo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-t border-white/20">
            <span className="text-sm text-purple-100">Aulas assistidas</span>
            <span className="font-semibold">{completedLessons} / {totalLessons}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-white/20">
            <span className="text-sm text-purple-100">Módulos concluídos</span>
            <span className="font-semibold">{completedModules} / {totalModules}</span>
          </div>
        </div>
      </div>

      {/* Modules Summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900">Módulos</h3>
        </div>

        <div className="space-y-3">
          {modules.map((module) => (
            <div key={module.moduleId} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 truncate">
                  {module.moduleName}
                </span>
                <span className="text-xs font-semibold text-purple-600 ml-2">
                  {module.progressPercentage}%
                </span>
              </div>
              <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${module.progressPercentage}%` }}
                  transition={{ duration: 0.6 }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Card */}
      {overallProgress === 100 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold">Parabéns!</h3>
              <p className="text-sm text-yellow-100">Curso concluído</p>
            </div>
          </div>
          <p className="text-sm">
            Você completou todas as aulas deste evento. Continue assim! 🎉
          </p>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 mb-2" />
          <div className="text-2xl font-bold text-green-900">{completedLessons}</div>
          <div className="text-xs text-green-700">Concluídas</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <BookOpen className="w-5 h-5 text-gray-600 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalLessons - completedLessons}</div>
          <div className="text-xs text-gray-700">Pendentes</div>
        </div>
      </div>
    </motion.div>
  )
}
