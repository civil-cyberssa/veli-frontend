"use client"

import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, Video, CheckCircle2, Star, MessageSquare, ArrowLeft, PlayCircle, FileText, Award, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"

import { cn } from "@/lib/utils"
import { useLiveClassList } from "@/src/features/dashboard/hooks/useLiveClassList"
import { useLatestClass } from "@/src/features/dashboard/hooks/useLatestClass"

export default function LiveClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const { data: liveClasses, isLoading: loadingLiveClasses, error: errorLiveClasses } = useLiveClassList(courseId)
  const { data: latestClass, isLoading: loadingLatestClass, error: errorLatestClass } = useLatestClass(courseId)

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    return {
      date: formattedDate.replace('.', ''),
      time: formattedTime
    }
  }

  const isUpcoming = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const now = new Date()
    return date > now
  }

  const isPast = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const now = new Date()
    return date < now
  }

  if (loadingLiveClasses || loadingLatestClass) {
    return (
      <div className="flex items-center justify-center h-96">
        <LogoPulseLoader label="Carregando aulas ao vivo..." />
      </div>
    )
  }

  if (errorLiveClasses) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-destructive">Erro ao carregar aulas: {errorLiveClasses.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-12">
      {/* Simple Header */}
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.push('/minhas-aulas')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Aulas ao Vivo
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas aulas e progresso
          </p>
        </div>
      </div>

      {/* Latest Class - Simplified */}
      {latestClass && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Última Aula Assistida</h2>

          <Card className="border">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Módulo</p>
                    <p className="font-medium">{latestClass.event.module.name}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Aula</p>
                    <p className="text-lg font-semibold">{latestClass.event.lesson.name}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDateTime(latestClass.event.scheduled_datetime).date} às{' '}
                      {formatDateTime(latestClass.event.scheduled_datetime).time}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {latestClass.watched && (
                    <Badge variant="secondary" className="gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Concluída
                    </Badge>
                  )}
                  {latestClass.rating && (
                    <Badge variant="outline" className="gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {latestClass.rating}/5
                    </Badge>
                  )}
                </div>
              </div>

              {(latestClass.comment || latestClass.teacher_answer || latestClass.exercise_id) && (
                <div className="pt-4 border-t space-y-4">
                  {latestClass.comment && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Seu comentário</p>
                      <p className="text-sm text-muted-foreground">{latestClass.comment}</p>
                    </div>
                  )}

                  {latestClass.teacher_answer && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-primary">Resposta do Professor</p>
                      <p className="text-sm text-muted-foreground">{latestClass.teacher_answer}</p>
                    </div>
                  )}

                  {latestClass.exercise_id && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Exercício</span>
                      </div>
                      <Badge variant="outline">
                        {latestClass.exercise_score} pontos
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Live Classes List - Simplified */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Próximas Aulas</h2>

        {!liveClasses || liveClasses.length === 0 ? (
          <Card className="border">
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-full bg-muted">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Nenhuma aula ao vivo agendada</p>
                  <p className="text-sm text-muted-foreground">Novas aulas serão adicionadas em breve</p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {liveClasses.map((liveClass) => {
              const upcoming = isUpcoming(liveClass.event.scheduled_datetime)
              const past = isPast(liveClass.event.scheduled_datetime)

              return (
                <Card
                  key={liveClass.event.id}
                  className={cn(
                    "border transition-colors",
                    upcoming && "hover:border-primary/50"
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            upcoming && "bg-primary/10",
                            past && "bg-muted"
                          )}>
                            <PlayCircle className={cn(
                              "h-5 w-5",
                              upcoming && "text-primary",
                              past && "text-muted-foreground"
                            )} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">
                              Módulo {liveClass.event.module.order}
                            </p>
                            <p className="text-sm font-medium">{liveClass.event.module.name}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-lg font-semibold">
                            {liveClass.event.lesson.name}
                          </p>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDateTime(liveClass.event.scheduled_datetime).date} às{' '}
                              {formatDateTime(liveClass.event.scheduled_datetime).time}
                            </span>
                          </div>
                        </div>

                        {liveClass.event.class_notice && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-900 dark:text-amber-100">
                              {liveClass.event.class_notice}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex flex-wrap gap-2 justify-end">
                          {upcoming && (
                            <Badge variant="outline" className="gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Em breve
                            </Badge>
                          )}
                          {past && liveClass.watched && (
                            <Badge variant="secondary" className="gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Assistida
                            </Badge>
                          )}
                          {liveClass.rating && (
                            <Badge variant="outline" className="gap-1.5">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              {liveClass.rating}/5
                            </Badge>
                          )}
                          {liveClass.exercise_id && (
                            <Badge variant="outline" className="gap-1.5">
                              <Award className="h-3.5 w-3.5" />
                              {liveClass.exercise_score}pts
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {(upcoming && liveClass.event.classroom_link) || (past && liveClass.event.event_recorded_link) ? (
                      <div className="mt-4 pt-4 border-t">
                        {upcoming && liveClass.event.classroom_link && (
                          <Button className="w-full gap-2" asChild>
                            <a href={liveClass.event.classroom_link} target="_blank" rel="noopener noreferrer">
                              Entrar na aula ao vivo
                              <ChevronRight className="h-4 w-4" />
                            </a>
                          </Button>
                        )}

                        {past && liveClass.event.event_recorded_link && (
                          <Button variant="outline" className="w-full gap-2" asChild>
                            <a href={liveClass.event.event_recorded_link} target="_blank" rel="noopener noreferrer">
                              Assistir gravação
                              <Video className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
