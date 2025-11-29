"use client"

import { Calendar, Clock, TrendingUp, ChevronRight, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useNextAsyncLesson } from "./hooks/useNextAsyncLesson"

export default function Dashboard() {
  const {
    data: subscriptions,
    loading,
    error,
    selectedSubscription,
    setSelectedSubscription
  } = useSubscriptions()

  // Hook para refetch do next-async ao mudar curso
  const { refetch: refetchNextAsync } = useNextAsyncLesson()

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

  // Data atual formatada
  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short' 
  }).replace('.', '')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Erro ao carregar inscrições: {error.message}</p>
      </div>
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Nenhuma inscrição encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com seletor de curso */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{currentDate}</span>
        </div>

        {/* Sempre mostra o curso selecionado */}
        {subscriptions.length === 1 && selectedSubscription ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
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
                // Força refetch do next-async com o novo curso
                setTimeout(() => refetchNextAsync(), 100)
              }
            }}
          >
            <SelectTrigger className="w-[240px]">
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

      {/* Card de boas-vindas com mapa */}
      <WelcomeCard />

      {/* Cards informativos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 - Próxima Aula */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Próxima aula
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{nextClass.date} • {nextClass.time}</span>
            </div>
            <div>
              <p className="font-medium">Assunto: {nextClass.topic}</p>
            </div>
            <Button variant="link" className="h-auto p-0 text-primary">
              Ver detalhes
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Card 2 - Atividade do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Play className="h-5 w-5" />
              Atividade do dia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{dailyActivity.type}</Badge>
              <span className="text-sm text-muted-foreground">• {dailyActivity.duration}</span>
            </div>
            <p className="text-sm">{dailyActivity.title}</p>
            <Button className="w-full">
              Começar agora
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Card 3 - Meu Nível */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Meu nível
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between gap-1">
              {level.levels.map((lvl) => (
                <div
                  key={lvl}
                  className={`flex-1 text-center text-xs font-medium ${
                    lvl === level.current
                      ? "text-primary"
                      : lvl < level.current
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {lvl}
                </div>
              ))}
            </div>
            <Progress value={level.progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Progresso estimado: <span className="font-medium text-foreground">{level.current}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}