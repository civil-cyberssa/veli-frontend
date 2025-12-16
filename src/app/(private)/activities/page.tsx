'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardList } from 'lucide-react'
import { useSubscriptions } from '@/src/features/dashboard/hooks/useSubscription'
import { DailyActivitiesList } from '@/src/features/lessons/components/daily-activities-list'

export default function ActivitiesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const { data: subscriptions, loading: isLoadingSubscriptions } = useSubscriptions()

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
            <ClipboardList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Atividades Diárias</h1>
            <p className="text-muted-foreground mt-1">
              Pratique e teste seus conhecimentos com atividades do curso
            </p>
          </div>
        </div>
      </div>

      {/* Seletor de Curso */}
      <Card className="p-6 mb-6 border-border/50">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Selecione o curso
          </label>
          <Select
            value={selectedCourseId?.toString() || ''}
            onValueChange={(value) => setSelectedCourseId(parseInt(value))}
            disabled={isLoadingSubscriptions}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha um curso..." />
            </SelectTrigger>
            <SelectContent>
              {subscriptions?.map((subscription) => (
                <SelectItem key={subscription.id} value={subscription.id.toString()}>
                  {subscription.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {subscriptions && subscriptions.length === 0 && !isLoadingSubscriptions && (
            <p className="text-sm text-muted-foreground">
              Você não está inscrito em nenhum curso ainda.
            </p>
          )}
        </div>
      </Card>

      {/* Lista de Atividades */}
      <DailyActivitiesList courseId={selectedCourseId} />
    </div>
  )
}
