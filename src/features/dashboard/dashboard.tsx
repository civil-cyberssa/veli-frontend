"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calendar, Clock, ArrowRight, CheckCircle2, FileText, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"
import { WelcomeCard } from "./components/map"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSubscriptions } from "./hooks/useSubscription"
import { useNextLiveClass } from "./hooks/useNextLiveClass"
import { useTodayDailyActivity } from "./hooks/useDailyActivities"

export default function Dashboard() {
  const router = useRouter()
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

  const {
    activity: todayActivity,
    isLoading: loadingTodayActivity
  } = useTodayDailyActivity(selectedSubscription?.id || null)

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
        <LogoPulseLoader label="Carregando seu painel..." />
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
    <div className="pb-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe seu progresso e próximas atividades
          </p>
        </div>

        {/* Seletor de curso */}
        {subscriptions.length === 1 && selectedSubscription ? (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-muted/80 to-muted/50 rounded-xl border border-border/50 shadow-sm">
            <Image
              src={selectedSubscription.course_icon}
              alt={selectedSubscription.course_name}
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-cover ring-2 ring-background"
            />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Curso atual</span>
              <span className="text-sm font-semibold">{selectedSubscription.course_name}</span>
            </div>
          </div>
        ) : subscriptions.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Selecione o curso</label>
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
              <SelectTrigger className="w-full sm:w-[260px] h-11 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((subscription) => (
                  <SelectItem key={subscription.id} value={subscription.id.toString()}>
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={subscription.course_icon}
                        alt={subscription.course_name}
                        width={18}
                        height={18}
                        className="h-[18px] w-[18px] rounded-full object-cover"
                      />
                      <span>{subscription.course_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Welcome Card */}
      <WelcomeCard />

      {/* Grid com Próxima Aula ao Vivo e Atividades */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próxima Aula ao Vivo */}
        <Card
          className="group relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 hover:scale-[1.01]"
          onClick={() => {
            if (selectedSubscription) {
              router.push(`/minhas-aulas/${selectedSubscription.student_class_id}`)
            }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Próxima Aula ao Vivo</h3>
                    <p className="text-xs text-muted-foreground">Prepare-se para a próxima sessão</p>
                  </div>
                </div>
              </div>
              {nextLiveClass && (
                <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-primary/10 text-primary border-primary/20">
                  Em breve
                </Badge>
              )}
            </div>

            {loadingNextClass ? (
              <div className="flex items-center justify-center py-12">
                <LogoPulseLoader label="Carregando próxima aula..." size={56} />
              </div>
            ) : errorNextClass ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm text-destructive font-medium">Erro ao carregar próxima aula</p>
              </div>
            ) : nextLiveClass ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {formatNextClassDateTime(nextLiveClass.scheduled_datetime).date} às {formatNextClassDateTime(nextLiveClass.scheduled_datetime).time}
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Módulo</p>
                    <p className="text-sm text-foreground/90">{nextLiveClass.module_name}</p>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aula</p>
                    <p className="text-base font-medium">{nextLiveClass.lesson_name}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {nextLiveClass.classroom_link && (
                    <Button className="w-full h-11 shadow-sm hover:shadow-md transition-all" asChild>
                      <a href={nextLiveClass.classroom_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        Entrar na aula
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full h-11 shadow-sm hover:shadow-md transition-all group/btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (selectedSubscription) {
                        router.push(`/minhas-aulas/${selectedSubscription.student_class_id}`)
                      }
                    }}
                  >
                    Ver todas as aulas
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="p-4 rounded-full bg-muted/50">
                  <Calendar className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nenhuma aula ao vivo agendada</p>
                  <p className="text-xs text-muted-foreground/70">Verifique novamente em breve</p>
                </div>
                <Button
                  variant="outline"
                  className="h-11 shadow-sm hover:shadow-md transition-all group/btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (selectedSubscription) {
                      router.push(`/minhas-aulas/${selectedSubscription.student_class_id}`)
                    }
                  }}
                >
                  Ver todas as aulas
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Atividade do Dia */}
        <Card
          className="group relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/30 hover:scale-[1.01]"
          onClick={() => router.push('/activities')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Atividade do Dia</h3>
                    <p className="text-xs text-muted-foreground">Teste seus conhecimentos hoje</p>
                  </div>
                </div>
              </div>
              {todayActivity && (
                <Badge
                  variant={todayActivity.is_done ? "default" : "secondary"}
                  className={cn(
                    "text-xs px-2.5 py-1 shadow-sm",
                    todayActivity.is_done
                      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                      : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900"
                  )}
                >
                  {todayActivity.is_done ? "Concluída" : "Pendente"}
                </Badge>
              )}
            </div>

            {loadingTodayActivity ? (
              <div className="flex items-center justify-center py-12">
                <LogoPulseLoader label="Carregando atividade..." size={56} />
              </div>
            ) : todayActivity ? (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 space-y-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Atividade</p>
                    <p className="text-base font-medium leading-snug">{todayActivity.name}</p>
                  </div>

                  {todayActivity.category && (
                    <>
                      <div className="h-px bg-border/50" />
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoria</p>
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                          {todayActivity.category}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {todayActivity.is_done ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm",
                      todayActivity.is_correct
                        ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                        : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                    )}
                  >
                    {todayActivity.is_correct ? (
                      <>
                        <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/50">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400">Parabéns!</p>
                          <p className="text-xs text-green-600 dark:text-green-500">Você acertou a resposta</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/50">
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Não foi dessa vez</p>
                          <p className="text-xs text-red-600 dark:text-red-500">Continue praticando</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    className="w-full h-11 shadow-sm hover:shadow-md transition-all group/btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/activities')
                    }}
                  >
                    Responder agora
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="p-4 rounded-full bg-muted/50">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nenhuma atividade disponível hoje</p>
                  <p className="text-xs text-muted-foreground/70">Volte amanhã para novas atividades</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
