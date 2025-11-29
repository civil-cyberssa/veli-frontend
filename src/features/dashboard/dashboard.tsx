"use client"

import { Calendar, Clock, TrendingUp, ArrowRight, Play } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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

  const dailyActivity = {
    type: "Exercício: Listening",
    duration: "10-12 min",
    title: 'Pratique com o diálogo "No restaurante" e responda às perguntas.',
  }

  const level = {
    current: "B1",
    progress: 65,
    levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
  }

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próxima Aula - Destaque maior */}
        <Card className="lg:col-span-2 border-border/50 overflow-hidden">
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

        {/* Meu Nível */}
        <Card className="border-border/50">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold">Meu Nível</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                {level.levels.map((lvl) => (
                  <div
                    key={lvl}
                    className={`text-xs font-medium transition-colors ${
                      lvl === level.current
                        ? "text-primary text-sm"
                        : lvl < level.current
                        ? "text-muted-foreground"
                        : "text-muted-foreground/40"
                    }`}
                  >
                    {lvl}
                  </div>
                ))}
              </div>

              <Progress value={level.progress} className="h-2" />

              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Progresso atual</p>
                <p className="text-2xl font-bold">{level.progress}%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Atividade do Dia - Full Width */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Play className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold">Atividade do Dia</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{dailyActivity.type}</Badge>
                  <span className="text-xs text-muted-foreground">• {dailyActivity.duration}</span>
                </div>
                <p className="text-sm text-muted-foreground">{dailyActivity.title}</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button size="lg" className="w-full lg:w-auto">
                Começar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
