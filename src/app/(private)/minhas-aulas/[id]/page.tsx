"use client"

import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, Video, CheckCircle2, Star, ArrowLeft, PlayCircle, FileText, Award, ChevronRight, ExternalLink } from "lucide-react"
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
    <div className="pb-16 space-y-8">
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

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Aulas ao Vivo
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas aulas e progresso
          </p>
        </div>
      </div>

      {/* Grid Layout - Main Content + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        {/* Main Column - Live Classes List */}
        <div className="space-y-6 min-w-0">
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
            <div className="grid gap-4 md:grid-cols-2">
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
                    <div className="p-5">
                      <div className="space-y-4">
                        {/* Module Info with Live Link Icon */}
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            upcoming && "bg-primary/10",
                            past && "bg-muted"
                          )}>
                            <PlayCircle className={cn(
                              "h-5 w-5",
                              upcoming && "text-primary",
                              past && "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Módulo {liveClass.event.module.order}
                            </p>
                            <p className="text-sm font-medium truncate">{liveClass.event.module.name}</p>
                          </div>
                          {upcoming && liveClass.event.classroom_link && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 p-0 hover:bg-primary/10"
                              asChild
                            >
                              <a
                                href={liveClass.event.classroom_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Entrar na aula ao vivo"
                              >
                                <ExternalLink className="h-4 w-4 text-primary" />
                              </a>
                            </Button>
                          )}
                          {past && liveClass.event.event_recorded_link && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 p-0 hover:bg-primary/10"
                              asChild
                            >
                              <a
                                href={liveClass.event.event_recorded_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ver gravação"
                              >
                                <Video className="h-4 w-4 text-primary" />
                              </a>
                            </Button>
                          )}
                        </div>

                        {/* Lesson Title */}
                        <div className="space-y-2">
                          <p className="font-semibold leading-tight line-clamp-2">
                            {liveClass.event.lesson.name}
                          </p>
                        </div>

                        {/* Date and Time */}
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-xs">
                              {formatDateTime(liveClass.event.scheduled_datetime).date}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">
                              {formatDateTime(liveClass.event.scheduled_datetime).time}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {upcoming && (
                            <Badge variant="outline" className="gap-1.5 text-xs">
                              <Clock className="h-3 w-3" />
                              Em breve
                            </Badge>
                          )}
                          {past && liveClass.watched && (
                            <Badge variant="secondary" className="gap-1.5 text-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              Assistida
                            </Badge>
                          )}
                          {liveClass.rating && (
                            <Badge variant="outline" className="gap-1.5 text-xs">
                              <Star className="h-3 w-3 fill-current" />
                              {liveClass.rating}/5
                            </Badge>
                          )}
                          {liveClass.exercise_id && (
                            <Badge variant="outline" className="gap-1.5 text-xs">
                              <Award className="h-3 w-3" />
                              {liveClass.exercise_score}pts
                            </Badge>
                          )}
                        </div>

                        {/* Notice */}
                        {liveClass.event.class_notice && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                            <FileText className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-900 dark:text-amber-100 line-clamp-2">
                              {liveClass.event.class_notice}
                            </p>
                          </div>
                        )}

                        {/* Action Button */}
                        {((upcoming && liveClass.event.classroom_link) || (past && liveClass.event.event_recorded_link)) && (
                          <div className="pt-1">
                            {upcoming && liveClass.event.classroom_link && (
                              <Button className="w-full gap-2 text-sm h-9" asChild>
                                <a href={liveClass.event.classroom_link} target="_blank" rel="noopener noreferrer">
                                  Entrar na aula
                                  <ChevronRight className="h-4 w-4" />
                                </a>
                              </Button>
                            )}

                            {past && liveClass.event.event_recorded_link && (
                              <Button variant="outline" className="w-full gap-2 text-sm h-9" asChild>
                                <a href={liveClass.event.event_recorded_link} target="_blank" rel="noopener noreferrer">
                                  Ver gravação
                                  <Video className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Latest Class */}
        {latestClass && (
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-lg font-semibold">Última Aula</h2>

            <Card className="border">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Módulo</p>
                    <p className="font-medium text-sm">{latestClass.event.module.name}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Aula</p>
                    <p className="font-semibold leading-tight">{latestClass.event.lesson.name}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDateTime(latestClass.event.scheduled_datetime).date}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {latestClass.watched && (
                      <Badge variant="secondary" className="gap-1.5 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Concluída
                      </Badge>
                    )}
                    {latestClass.rating && (
                      <Badge variant="outline" className="gap-1.5 text-xs">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {latestClass.rating}/5
                      </Badge>
                    )}
                  </div>
                </div>

                {(latestClass.comment || latestClass.teacher_answer || latestClass.exercise_id) && (
                  <div className="pt-4 border-t space-y-4">
                    {latestClass.comment && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">Seu comentário</p>
                        <p className="text-sm leading-relaxed">{latestClass.comment}</p>
                      </div>
                    )}

                    {latestClass.teacher_answer && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-primary">Resposta do Professor</p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{latestClass.teacher_answer}</p>
                      </div>
                    )}

                    {latestClass.exercise_id && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Exercício</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {latestClass.exercise_score} pts
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
