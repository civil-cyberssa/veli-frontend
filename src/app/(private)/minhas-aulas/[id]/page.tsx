"use client"

import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, Video, CheckCircle2, Star, ArrowLeft, PlayCircle, Award, ChevronRight, ExternalLink, Users, Bell } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { cn } from "@/lib/utils"
import { useLiveClassList, type LiveClassEvent } from "@/src/features/dashboard/hooks/useLiveClassList"
import { useLatestClass } from "@/src/features/dashboard/hooks/useLatestClass"
import { getFlagFromCourseName, getFlagFromLanguageMetadata } from "@/src/utils/languageFlags"

// Calculate time until class
const getTimeUntilClass = (dateTimeString: string): string => {
  const classDate = new Date(dateTimeString)
  const now = new Date()
  const diffMs = classDate.getTime() - now.getTime()
  
  if (diffMs < 0) return ''
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `Em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
  if (diffHours > 0) return `Em ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  return 'Em breve'
}

export default function LiveClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const subscriptionId = params.id as string

  const { data: liveClasses, isLoading: loadingLiveClasses, error: errorLiveClasses } = useLiveClassList(subscriptionId)
  const { data: latestClass, isLoading: loadingLatestClass } = useLatestClass(subscriptionId)

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const formattedDate = date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    })
    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    return {
      date: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1).replace('.', ''),
      time: formattedTime
    }
  }

  const isUpcoming = (dateTimeString: string) => {
    return new Date(dateTimeString) > new Date()
  }

  const isPast = (dateTimeString: string) => {
    return new Date(dateTimeString) < new Date()
  }

  // Sort and filter classes
  const sortedClasses = liveClasses ? [...liveClasses].sort((a, b) => {
    const aDate = new Date(a.event.scheduled_datetime)
    const bDate = new Date(b.event.scheduled_datetime)
    const now = new Date()

    const aIsUpcoming = aDate > now
    const bIsUpcoming = bDate > now

    if (aIsUpcoming && bIsUpcoming) return aDate.getTime() - bDate.getTime()
    if (!aIsUpcoming && !bIsUpcoming) return bDate.getTime() - aDate.getTime()
    return aIsUpcoming ? -1 : 1
  }) : []

  const upcomingClasses = sortedClasses.filter(c => isUpcoming(c.event.scheduled_datetime))
  const pastClasses = sortedClasses.filter(c => isPast(c.event.scheduled_datetime))
  const nextClass = upcomingClasses[0]

  const courseName =
    (liveClasses && liveClasses.length > 0 && liveClasses[0].event.module.name) ||
    latestClass?.event.module.name ||
    ''

  const findCourseFlag = () => {
    const latestFlag = getFlagFromLanguageMetadata(latestClass?.event)
    if (latestFlag) return latestFlag

    if (liveClasses) {
      for (const liveClass of liveClasses) {
        const flag = getFlagFromLanguageMetadata(liveClass.event)
        if (flag) return flag
      }
    }

    return ''
  }

  const courseFlag = findCourseFlag() || getFlagFromCourseName(courseName) || '🌐'

  if (loadingLiveClasses || loadingLatestClass) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LogoPulseLoader label="Carregando aulas ao vivo..." />
      </div>
    )
  }

  if (errorLiveClasses) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-destructive/10">
          <Video className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium text-destructive">Erro ao carregar aulas</p>
          <p className="text-sm text-muted-foreground">{errorLiveClasses.message}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  const renderClassCard = (liveClass: LiveClassEvent, isNextClass: boolean = false) => {
    const upcoming = isUpcoming(liveClass.event.scheduled_datetime)
    const past = isPast(liveClass.event.scheduled_datetime)
    const flag = getFlagFromLanguageMetadata(liveClass.event) || getFlagFromCourseName(liveClass.event.module.name) || '🌐'
    const timeUntil = upcoming ? getTimeUntilClass(liveClass.event.scheduled_datetime) : ''

    return (
      <Card
        className={cn(
          "border transition-all hover:shadow-md group overflow-hidden",
          upcoming && "hover:border-primary/50",
          isNextClass && "ring-2 ring-primary shadow-lg"
        )}
      >
        <div className="p-5 space-y-4">
          {/* Compact Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="text-3xl leading-none flex-shrink-0">{flag}</div>
              <div className="flex-1 min-w-0 space-y-0.5">
                {isNextClass && (
                  <Badge className="gap-1 text-xs h-5 animate-pulse">
                    <Bell className="h-2.5 w-2.5" />
                    Próxima
                  </Badge>
                )}
                {upcoming && !isNextClass && timeUntil && (
                  <Badge variant="secondary" className="gap-1 text-xs h-5">
                    <Clock className="h-2.5 w-2.5" />
                    {timeUntil}
                  </Badge>
                )}
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                  Módulo {liveClass.event.module.order}
                </p>
              </div>
            </div>

            {/* Quick Action */}
            {upcoming && liveClass.event.classroom_link && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-primary/10 flex-shrink-0"
                asChild
              >
                <a
                  href={liveClass.event.classroom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Entrar na aula"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                </a>
              </Button>
            )}
            {past && liveClass.event.event_recorded_link && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-primary/10 flex-shrink-0"
                asChild
              >
                <a
                  href={liveClass.event.event_recorded_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver gravação"
                >
                  <PlayCircle className="h-3.5 w-3.5 text-primary" />
                </a>
              </Button>
            )}
          </div>

          {/* Lesson Title - More compact */}
          <div>
            <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {liveClass.event.lesson.name}
            </h3>
          </div>

          {/* Date and Time - Inline and compact */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{formatDateTime(liveClass.event.scheduled_datetime).date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{formatDateTime(liveClass.event.scheduled_datetime).time}</span>
            </div>
          </div>

          {/* Compact Status Badges */}
          {(liveClass.watched || liveClass.rating || liveClass.exercise_id) && (
            <div className="flex flex-wrap gap-1.5">
              {liveClass.watched && (
                <Badge variant="secondary" className="gap-1 text-[10px] h-5 px-2">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Assistida
                </Badge>
              )}
              {liveClass.rating && (
                <Badge variant="outline" className="gap-1 text-[10px] h-5 px-2">
                  <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                  {liveClass.rating}/5
                </Badge>
              )}
              {liveClass.exercise_id && (
                <Badge variant="outline" className="gap-1 text-[10px] h-5 px-2">
                  <Award className="h-2.5 w-2.5 text-primary" />
                  {liveClass.exercise_score}pts
                </Badge>
              )}
            </div>
          )}

          {/* Notice - More compact */}
          {liveClass.event.class_notice && (
            <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <p className="text-[10px] leading-relaxed text-amber-900 dark:text-amber-100 line-clamp-2">
                💡 {liveClass.event.class_notice}
              </p>
            </div>
          )}

          {/* Compact Action Button */}
          {((upcoming && liveClass.event.classroom_link) || (past && liveClass.event.event_recorded_link)) && (
            <div className="pt-1">
              {upcoming && liveClass.event.classroom_link && (
                <Button className="w-full gap-2 h-9 text-sm font-semibold" asChild>
                  <a href={liveClass.event.classroom_link} target="_blank" rel="noopener noreferrer">
                    <Video className="h-3.5 w-3.5" />
                    Entrar na aula
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </a>
                </Button>
              )}

              {past && liveClass.event.event_recorded_link && (
                <Button variant="outline" className="w-full gap-2 h-9 text-sm font-medium" asChild>
                  <a href={liveClass.event.event_recorded_link} target="_blank" rel="noopener noreferrer">
                    <PlayCircle className="h-3.5 w-3.5" />
                    Assistir gravação
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className=" max-h-svh pb-16 space-y-6 px-4 sm:px-6">
      {/* Compact Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground -ml-2 h-8"
          onClick={() => router.push('/minhas-aulas')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="text-sm">Voltar</span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-4xl leading-none">{courseFlag}</div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Aulas ao Vivo
            </h1>
            <p className="text-sm text-muted-foreground">
              Participe e assista às gravações
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!sortedClasses || sortedClasses.length === 0 ? (
        <Card className="border-dashed">
          <div className="p-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-muted">
                <Video className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold">Nenhuma aula agendada</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Novas aulas serão adicionadas em breve
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/minhas-aulas')}>
                Ver todas as aulas
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-5">
          {/* Compact Tabs Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <TabsList className="h-9">
              <TabsTrigger value="upcoming" className="gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5" />
                Próximas ({upcomingClasses.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="gap-1.5 text-sm">
                <PlayCircle className="h-3.5 w-3.5" />
                Anteriores ({pastClasses.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{sortedClasses.length} aulas</span>
            </div>
          </div>

          {/* Upcoming Classes Tab */}
          <TabsContent value="upcoming" className="space-y-5 mt-0">
            {upcomingClasses.length === 0 ? (
              <Card className="border-dashed">
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2.5">
                    <Clock className="h-7 w-7 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Nenhuma aula próxima</p>
                      <p className="text-xs text-muted-foreground">
                        Confira as gravações disponíveis
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {/* Next Class Highlight */}
                {nextClass && (
                  <div className="space-y-2.5">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Próxima aula
                    </h2>
                    <div className="max-w-md">
                      {renderClassCard(nextClass, true)}
                    </div>
                  </div>
                )}

                {/* Other Upcoming Classes */}
                {upcomingClasses.length > 1 && (
                  <div className="space-y-3">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Outras aulas
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {upcomingClasses.slice(1).map((liveClass) => (
                        <div key={liveClass.event.id}>
                          {renderClassCard(liveClass)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Past Classes Tab */}
          <TabsContent value="past" className="space-y-3 mt-0">
            {pastClasses.length === 0 ? (
              <Card className="border-dashed">
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2.5">
                    <PlayCircle className="h-7 w-7 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Nenhuma gravação</p>
                      <p className="text-xs text-muted-foreground">
                        As gravações aparecerão após as aulas
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pastClasses.map((liveClass) => (
                  <div key={liveClass.event.id}>
                    {renderClassCard(liveClass)}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
