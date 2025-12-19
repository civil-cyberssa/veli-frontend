"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { PlayCircle, ChevronRight, Clock, Video, Calendar, ExternalLink, Award, CheckCircle2, Star, Bell, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogoPulseLoader } from "@/components/shared/logo-loader"

import { cn } from "@/lib/utils"
import { useSubscriptions } from "@/src/features/dashboard/hooks/useSubscription"
import { useAllLiveClasses } from "@/src/features/dashboard/hooks/useAllLiveClasses"
import { getFlagFromCourseName, getFlagFromLanguageMetadata } from "@/src/utils/languageFlags"

export default function MinhasAulasPage() {
  const router = useRouter()
  const { data: subscriptions, loading, error } = useSubscriptions()
  const { data: allLiveClasses, isLoading: loadingAllClasses, error: allClassesError } = useAllLiveClasses(subscriptions)

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

  const isUpcoming = (dateTimeString: string) => new Date(dateTimeString) > new Date()
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

  const sortedAllLiveClasses = allLiveClasses
    ? [...allLiveClasses].sort((a, b) => {
        const now = new Date()
        const aDate = new Date(a.event.scheduled_datetime)
        const bDate = new Date(b.event.scheduled_datetime)

        const aUpcoming = aDate > now
        const bUpcoming = bDate > now

        if (aUpcoming && bUpcoming) return aDate.getTime() - bDate.getTime()
        if (!aUpcoming && !bUpcoming) return bDate.getTime() - aDate.getTime()
        return aUpcoming ? -1 : 1
      })
    : []
  const upcomingClasses = sortedAllLiveClasses.filter((liveClass) => isUpcoming(liveClass.event.scheduled_datetime))
  const pastClasses = sortedAllLiveClasses.filter((liveClass) => !isUpcoming(liveClass.event.scheduled_datetime))
  const nextClass = upcomingClasses[0]

  const renderClassCard = (liveClass: (typeof sortedAllLiveClasses)[number], isNextClass: boolean = false) => {
    const upcoming = isUpcoming(liveClass.event.scheduled_datetime)
    const past = !upcoming
    const flag =
      getFlagFromLanguageMetadata(liveClass.event) || getFlagFromCourseName(liveClass.course.course_name) || '🌐'
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
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src={liveClass.course.course_icon}
                    alt={liveClass.course.course_name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded object-cover"
                  />
                  <p className="text-sm font-medium line-clamp-1">{liveClass.course.course_name}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[10px] uppercase tracking-wide">
                  <p className="text-muted-foreground font-semibold">Módulo {liveClass.event.module.order}</p>
                  {isNextClass && (
                    <Badge className="gap-1 text-[10px] h-5">
                      <Bell className="h-2.5 w-2.5" />
                      Próxima
                    </Badge>
                  )}
                  {upcoming && !isNextClass && timeUntil && (
                    <Badge variant="secondary" className="gap-1 text-[10px] h-5">
                      <Clock className="h-2.5 w-2.5" />
                      {timeUntil}
                    </Badge>
                  )}
                </div>
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

          {/* Lesson Title */}
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {liveClass.event.lesson.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{liveClass.event.module.name}</p>
          </div>

          {/* Date and Time */}
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

          {/* Status Badges */}
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

          {/* Notice */}
          {liveClass.event.class_notice && (
            <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <p className="text-[10px] leading-relaxed text-amber-900 dark:text-amber-100 line-clamp-2">
                💡 {liveClass.event.class_notice}
              </p>
            </div>
          )}

          {/* Actions */}
          {((upcoming && liveClass.event.classroom_link) || (past && liveClass.event.event_recorded_link)) && (
            <div className="pt-1 flex items-center gap-2">
              {upcoming && liveClass.event.classroom_link && (
                <Button className="flex-1 gap-2 h-9 text-sm font-semibold" asChild>
                  <a href={liveClass.event.classroom_link} target="_blank" rel="noopener noreferrer">
                    <Video className="h-3.5 w-3.5" />
                    Entrar na aula
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </a>
                </Button>
              )}

              {past && liveClass.event.event_recorded_link && (
                <Button variant="outline" className="flex-1 gap-2 h-9 text-sm font-medium" asChild>
                  <a href={liveClass.event.event_recorded_link} target="_blank" rel="noopener noreferrer">
                    <PlayCircle className="h-3.5 w-3.5" />
                    Assistir gravação
                  </a>
                </Button>
              )}

              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={() => router.push(`/minhas-aulas/${liveClass.student_class_id}`)}
                title="Ver detalhes do curso"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LogoPulseLoader label="Carregando seus cursos..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-destructive">Erro ao carregar cursos: {error.message}</p>
      </div>
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground">Nenhum curso encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-10">
      {/* Simple Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Minhas Aulas
        </h1>
        <p className="text-muted-foreground">
          Acompanhe todas as aulas ao vivo dos cursos em que você está inscrito
        </p>
      </div>

      {/* Aggregated Live Classes */}
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Aulas ao vivo de todos os cursos</h2>
            <p className="text-sm text-muted-foreground">Mesmo visual e ações rápidas que você vê nas páginas individuais</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{sortedAllLiveClasses.length} aulas</span>
          </div>
        </div>

        {loadingAllClasses ? (
          <div className="flex items-center justify-center h-48">
            <LogoPulseLoader label="Carregando aulas ao vivo..." />
          </div>
        ) : allClassesError ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm text-destructive">Erro ao carregar aulas: {allClassesError.message}</p>
          </div>
        ) : !allLiveClasses || allLiveClasses.length === 0 ? (
          <Card className="border-dashed">
            <div className="p-10 text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Video className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-semibold">Nenhuma aula encontrada</p>
              <p className="text-sm text-muted-foreground">As aulas ao vivo aparecerão aqui assim que forem liberadas</p>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-4 mt-1">
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
            </div>

            <TabsContent value="upcoming" className="space-y-4 mt-0">
              {upcomingClasses.length === 0 ? (
                <Card className="border-dashed">
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2.5">
                      <Clock className="h-7 w-7 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Nenhuma aula próxima</p>
                        <p className="text-xs text-muted-foreground">Confira as gravações disponíveis</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  {nextClass && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Próxima aula
                      </h3>
                      <div className="max-w-2xl">
                        {renderClassCard(nextClass, true)}
                      </div>
                    </div>
                  )}

                  {upcomingClasses.length > 1 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Outras aulas
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {upcomingClasses.slice(1).map((liveClass) => (
                          <div key={`${liveClass.event.id}-${liveClass.student_class_id}`}>{renderClassCard(liveClass)}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3 mt-0">
              {pastClasses.length === 0 ? (
                <Card className="border-dashed">
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2.5">
                      <PlayCircle className="h-7 w-7 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Nenhuma gravação</p>
                        <p className="text-xs text-muted-foreground">As gravações aparecerão após as aulas</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pastClasses.map((liveClass) => (
                    <div key={`${liveClass.event.id}-${liveClass.student_class_id}`}>{renderClassCard(liveClass)}</div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Course Cards Grid - Simplified */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Cursos inscritos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription) => (
            <Card
              key={subscription.id}
              className="group border transition-all hover:border-primary/50 cursor-pointer"
              onClick={() => router.push(`/minhas-aulas/${subscription.student_class_id}`)}
            >
              <div className="p-6 space-y-6">
                {/* Course Icon and Info */}
                <div className="flex items-start gap-4">
                  <Image
                    src={subscription.course_icon}
                    alt={subscription.course_name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover"
                  />

                  <div className="flex-1 space-y-2 min-w-0">
                    <h3 className="font-semibold text-base leading-tight line-clamp-2">
                      {subscription.course_name}
                    </h3>
                    <Badge
                      variant={subscription.status === 'active' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {subscription.status === 'active' ? 'Ativo' : subscription.status}
                    </Badge>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  variant="outline"
                  className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/minhas-aulas/${subscription.student_class_id}`)
                  }}
                >
                  Acessar aulas
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
