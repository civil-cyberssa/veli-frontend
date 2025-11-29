"use client"

import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WelcomeCard } from "./components/map"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSubscriptions } from "./hooks/useSubscription"
import { useNextLiveClass } from "./hooks/useNextLiveClass"

export default function Dashboard() {
  const {
    data: subscriptions,
    loading,
    error,
    selectedSubscription,
    setSelectedSubscription
  } = useSubscriptions()

  const {
    data: nextLiveClass,
    loading: loadingNextClass,
    error: errorNextClass
  } = useNextLiveClass(selectedSubscription?.id || null)

  // Data atual formatada
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  }).replace('.', '')

  // Formata a data e hora da próxima aula
  const formatNextClassDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const formattedDate = date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short'
    })
    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Capitaliza a primeira letra do dia da semana
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

    return {
      date: capitalizedDate.replace('.', ''),
      time: formattedTime
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-destructive">Erro ao carregar inscrições: {error.message}</p>
      </div>
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground">Nenhuma inscrição encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {currentDate}
          </p>
        </div>

        {/* Seletor de curso */}
        {subscriptions.length === 1 && selectedSubscription ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50">
            <img
              src={selectedSubscription.course_icon}
              alt={selectedSubscription.course_name}
              className="h-5 w-5 rounded-full object-cover"
            />
            <span className="text-sm font-medium">{selectedSubscription.course_name}</span>
          </div>
        ) : subscriptions.length > 1 && (
          <Select
            value={selectedSubscription?.id.toString()}
            onValueChange={(value) => {
              const subscription = subscriptions.find(s => s.id === parseInt(value))
              if (subscription) {
                setSelectedSubscription(subscription)
                setTimeout(() => window.location.reload(), 100)
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subscriptions.map((subscription) => (
                <SelectItem key={subscription.id} value={subscription.id.toString()}>
                  <div className="flex items-center gap-2">
                    <img
                      src={subscription.course_icon}
                      alt={subscription.course_name}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                    <span>{subscription.course_name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Welcome Card */}
      <WelcomeCard />

      {/* Próxima Aula ao Vivo */}
      <Card className="border-border/50 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Próxima Aula ao Vivo</h3>
                </div>
              </div>
              {nextLiveClass && (
                <Badge variant="secondary" className="text-xs">
                  Em breve
                </Badge>
              )}
            </div>

            {loadingNextClass ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            ) : errorNextClass ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-destructive">Erro ao carregar próxima aula</p>
              </div>
            ) : nextLiveClass ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatNextClassDateTime(nextLiveClass.start_time).date} às {formatNextClassDateTime(nextLiveClass.start_time).time}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-sm font-medium mb-1">Título</p>
                  <p className="text-base">{nextLiveClass.title}</p>
                  {nextLiveClass.description && (
                    <>
                      <p className="text-sm font-medium mb-1 mt-3">Descrição</p>
                      <p className="text-sm text-muted-foreground">{nextLiveClass.description}</p>
                    </>
                  )}
                  {nextLiveClass.teacher_name && (
                    <>
                      <p className="text-sm font-medium mb-1 mt-3">Professor(a)</p>
                      <p className="text-sm text-muted-foreground">{nextLiveClass.teacher_name}</p>
                    </>
                  )}
                </div>

                {nextLiveClass.meeting_url && (
                  <Button className="w-full sm:w-auto" asChild>
                    <a href={nextLiveClass.meeting_url} target="_blank" rel="noopener noreferrer">
                      Entrar na aula
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <Calendar className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Nenhuma aula ao vivo agendada</p>
              </div>
            )}
          </div>
        </Card>
    </div>
  )
}
