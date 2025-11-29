'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, AlertCircle } from 'lucide-react'
import { useEventProgress } from '@/features/event-progress/hooks/useEventProgress'
import { ModuleCard } from '@/features/event-progress/components/ModuleCard'
import { ProgressSidebar } from '@/features/event-progress/components/ProgressSidebar'

export default function EventProgressPage() {
  const params = useParams()
  const eventId = params?.id ? parseInt(params.id as string) : null

  const { data, isLoading, error } = useEventProgress(eventId)

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-48 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          <div className="flex gap-8">
            {/* Main Content Skeleton */}
            <div className="flex-1 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="flex-1">
                      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2].map((j) => (
                      <div key={j} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-80">
              <div className="sticky top-6">
                <div className="bg-purple-600 rounded-2xl p-6 h-96 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erro ao carregar progresso
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar o progresso do evento. Por favor, tente novamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Tentar novamente
          </button>
        </motion.div>
      </div>
    )
  }

  // No Data State
  if (!data || data.modules.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhum progresso encontrado
          </h2>
          <p className="text-gray-600">
            Não há dados de progresso disponíveis para este evento.
          </p>
        </motion.div>
      </div>
    )
  }

  // Main Content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Progresso do Evento
          </h1>
          <p className="text-gray-600">
            Acompanhe seu progresso e veja todas as aulas do evento
          </p>
        </motion.div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {data.modules.map((module, index) => (
              <ModuleCard key={module.moduleId} module={module} index={index} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <ProgressSidebar data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
