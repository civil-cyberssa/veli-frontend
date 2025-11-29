"use client"

import Dashboard from "@/src/features/dashboard/dashboard"
import { CourseSelection } from "@/src/features/dashboard/components/course-selection"
import { useSubscriptions } from "@/src/features/dashboard/hooks/useSubscription"

export default function DashboardPage() {
  const {
    data: subscriptions,
    loading,
    error,
    selectedSubscription,
    setSelectedSubscription,
    hasSelectedCourse,
    markCourseAsSelected,
  } = useSubscriptions()

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Erro ao carregar inscrições: {error.message}</p>
      </div>
    )
  }

  // No subscriptions
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Nenhuma inscrição encontrada</p>
      </div>
    )
  }

  // Se houver múltiplos cursos e o usuário ainda não selecionou um, mostra a tela de seleção
  if (subscriptions.length > 1 && !hasSelectedCourse) {
    return (
      <CourseSelection
        subscriptions={subscriptions}
        onCourseSelect={(subscription) => {
          setSelectedSubscription(subscription)
          markCourseAsSelected()
        }}
      />
    )
  }

  // Caso contrário, mostra o dashboard normal
  return <Dashboard />
}