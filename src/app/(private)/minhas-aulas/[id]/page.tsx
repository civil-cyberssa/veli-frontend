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

  // Separate classes into upcoming and past
  const upcomingClasses = liveClasses?.filter(c => isUpcoming(c.event.scheduled_datetime)) || []
  const pastClasses = liveClasses?.filter(c => isPast(c.event.scheduled_datetime)) || []

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

  const renderClassCard = (liveClass: typeof liveClasses[0], upcoming: boolean) => {
    const past = !upcoming

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

      {/* 2 Column Layout - Upcoming vs Past */}
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
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Column 1 - Upcoming Classes */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2 className="text-lg font-semibold">Próximas Aulas</h2>
              {upcomingClasses.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {upcomingClasses.length}
                </Badge>
              )}
            </div>

            {upcomingClasses.length === 0 ? (
              <Card className="border">
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-muted">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Nenhuma aula próxima
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Novas aulas serão agendadas em breve
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map(liveClass => renderClassCard(liveClass, true))}
              </div>
            )}
          </div>

          {/* Column 2 - Past Classes */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-muted-foreground rounded-full" />
              <h2 className="text-lg font-semibold">Aulas Anteriores</h2>
              {pastClasses.length > 0 && (
                <Badge variant="outline" className="ml-auto">
                  {pastClasses.length}
                </Badge>
              )}
            </div>

            {pastClasses.length === 0 ? (
              <Card className="border">
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-muted">
                      <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Nenhuma aula anterior
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Suas aulas assistidas aparecerão aqui
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastClasses.map(liveClass => renderClassCard(liveClass, false))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
