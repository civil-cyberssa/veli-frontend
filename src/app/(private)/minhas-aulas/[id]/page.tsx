"use client"

import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, Video, CheckCircle2, Star, MessageSquare, ArrowLeft, PlayCircle, FileText, Award } from "lucide-react"
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
    <div className="pb-8 space-y-8">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          className="w-fit gap-2"
          onClick={() => router.push('/minhas-aulas')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para meus cursos
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Aulas ao Vivo
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe suas aulas e progresso
          </p>
        </div>
      </div>

      {/* Latest Class Section */}
      {latestClass && (
        <Card className="border-border/50 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Última Aula Assistida</h2>
                <p className="text-xs text-muted-foreground">Seu progresso recente</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Módulo</p>
                    <p className="text-sm text-foreground/90">{latestClass.event.module.name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aula</p>
                    <p className="text-base font-medium">{latestClass.event.lesson.name}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDateTime(latestClass.event.scheduled_datetime).date} às{' '}
                      {formatDateTime(latestClass.event.scheduled_datetime).time}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {latestClass.watched && (
                    <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Assistida
                    </Badge>
                  )}
                  {latestClass.rating && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {latestClass.rating}/5
                    </Badge>
                  )}
                </div>
              </div>

              {latestClass.comment && (
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">Seu comentário</p>
                      <p className="text-sm">{latestClass.comment}</p>
                    </div>
                  </div>
                </div>
              )}

              {latestClass.teacher_answer && (
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-semibold text-primary">Resposta do Professor</p>
                      <p className="text-sm">{latestClass.teacher_answer}</p>
                    </div>
                  </div>
                </div>
              )}

              {latestClass.exercise_id && (
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Exercício</span>
                    </div>
                    <Badge variant="secondary">
                      Nota: {latestClass.exercise_score}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Live Classes List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Próximas Aulas ao Vivo</h2>
            <p className="text-xs text-muted-foreground">Programação de aulas</p>
          </div>
        </div>

        {!liveClasses || liveClasses.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-muted/50">
                <Video className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nenhuma aula ao vivo agendada</p>
                <p className="text-xs text-muted-foreground/70">Novas aulas serão adicionadas em breve</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {liveClasses.map((liveClass) => {
              const upcoming = isUpcoming(liveClass.event.scheduled_datetime)
              const past = isPast(liveClass.event.scheduled_datetime)

              return (
                <Card
                  key={liveClass.event.id}
                  className={cn(
                    "group relative overflow-hidden border-border/50 shadow-sm transition-all duration-300",
                    upcoming && "hover:shadow-md hover:border-primary/30"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300",
                    upcoming && "group-hover:opacity-100"
                  )} />

                  <div className="relative p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            upcoming && "bg-primary/10",
                            past && "bg-muted"
                          )}>
                            <PlayCircle className={cn(
                              "h-4 w-4",
                              upcoming && "text-primary",
                              past && "text-muted-foreground"
                            )} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Módulo {liveClass.event.module.order}
                            </p>
                            <p className="text-sm text-foreground/90">{liveClass.event.module.name}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-base font-medium">{liveClass.event.lesson.name}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {formatDateTime(liveClass.event.scheduled_datetime).date} às{' '}
                            {formatDateTime(liveClass.event.scheduled_datetime).time}
                          </span>
                        </div>

                        {liveClass.event.class_notice && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-xs text-muted-foreground">{liveClass.event.class_notice}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {upcoming && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            Em breve
                          </Badge>
                        )}
                        {past && liveClass.watched && (
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Assistida
                          </Badge>
                        )}
                        {liveClass.rating && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {liveClass.rating}/5
                          </Badge>
                        )}
                        {liveClass.exercise_id && (
                          <Badge variant="secondary">
                            <Award className="h-3 w-3 mr-1" />
                            {liveClass.exercise_score}pts
                          </Badge>
                        )}
                      </div>
                    </div>

                    {upcoming && liveClass.event.classroom_link && (
                      <Button className="w-full h-10 shadow-sm hover:shadow-md transition-all" asChild>
                        <a href={liveClass.event.classroom_link} target="_blank" rel="noopener noreferrer">
                          Entrar na aula
                          <PlayCircle className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}

                    {past && liveClass.event.event_recorded_link && (
                      <Button variant="outline" className="w-full h-10" asChild>
                        <a href={liveClass.event.event_recorded_link} target="_blank" rel="noopener noreferrer">
                          Ver gravação
                          <Video className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
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
