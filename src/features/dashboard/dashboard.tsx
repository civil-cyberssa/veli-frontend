"use client"

import { Calendar, Clock, TrendingUp, ArrowRight, Play, BookOpen, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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

export default function Dashboard() {
  const {
    data: subscriptions,
    loading,
    error,
    selectedSubscription,
    setSelectedSubscription
  } = useSubscriptions()

  // Dados de exemplo (após integração, virão da API baseado no selectedId)
  const nextClass = {
    date: "Quarta, 27 Set",
    time: "18:00",
    topic: "Conversação — Viagens",
  }

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

  const stats = [
    { label: "Aulas concluídas", value: "24", icon: BookOpen, color: "text-blue-600 dark:text-blue-400" },
    { label: "Sequência", value: "7 dias", icon: Star, color: "text-amber-600 dark:text-amber-400" },
    { label: "Nível atual", value: level.current, icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
  ]

  // Data atual formatada
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  }).replace('.', '')

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-lg bg-muted/50 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                  <h3 className="font-semibold">Próxima Aula</h3>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                Em breve
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{nextClass.date} às {nextClass.time}</span>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm font-medium mb-1">Tema da aula</p>
                <p className="text-base">{nextClass.topic}</p>
              </div>

              <Button className="w-full sm:w-auto" variant="outline">
                Ver detalhes da aula
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
