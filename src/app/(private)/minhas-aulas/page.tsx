"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { PlayCircle, ChevronRight, Clock, Video, Calendar as CalendarIcon, ExternalLink, Award, CheckCircle2, Star, Bell, Users, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogoPulseLoader } from "@/components/shared/logo-loader"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Calendar } from "@/components/ui/calendar"

import { cn } from "@/lib/utils"
import { useSubscriptions } from "@/src/features/dashboard/hooks/useSubscription"
import { useAllLiveClasses } from "@/src/features/dashboard/hooks/useAllLiveClasses"
import { getFlagFromCourseName, getFlagFromLanguageMetadata } from "@/src/utils/languageFlags"

export default function MinhasAulasPage() {
  const router = useRouter()
  const { data: subscriptions, loading, error } = useSubscriptions()
  const { data: allLiveClasses, isLoading: loadingAllClasses, error: allClassesError } = useAllLiveClasses(subscriptions)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

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
  const latestClass = pastClasses[0]

  // Get dates with classes for calendar highlighting
  const datesWithClasses = sortedAllLiveClasses.map(liveClass => {
    const date = new Date(liveClass.event.scheduled_datetime)
    date.setHours(0, 0, 0, 0)
    return date
  })

  // Filter classes for selected date
  const selectedDateClasses = selectedDate
    ? sortedAllLiveClasses.filter(liveClass => {
        const classDate = new Date(liveClass.event.scheduled_datetime)
        return (
          classDate.getFullYear() === selectedDate.getFullYear() &&
          classDate.getMonth() === selectedDate.getMonth() &&
          classDate.getDate() === selectedDate.getDate()
        )
      })
    : []

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

      {/* Calendar View */}
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Calendário de Aulas</h2>
            <p className="text-sm text-muted-foreground">Visualize e selecione suas aulas por data</p>
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
          <div className="grid lg:grid-cols-[auto_1fr] gap-6">
            {/* Calendar Section */}
            <Card className="p-4 w-fit mx-auto lg:mx-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  hasClass: datesWithClasses
                }}
                modifiersClassNames={{
                  hasClass: "bg-primary/20 font-bold"
                }}
                className="rounded-md"
              />
            </Card>

            {/* Selected Date Classes or Latest Class */}
            <div className="space-y-4">
              {selectedDate && selectedDateClasses.length > 0 ? (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      Aulas de {selectedDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(undefined)}
                      className="h-7 text-xs"
                    >
                      Limpar seleção
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedDateClasses.map((liveClass) => (
                      <div key={`${liveClass.event.id}-${liveClass.student_class_id}`}>
                        {renderClassCard(liveClass)}
                      </div>
                    ))}
                  </div>
                </>
              ) : latestClass ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Última Aula</h3>
                  <div className="max-w-2xl">
                    {renderClassCard(latestClass)}
                  </div>

                  {/* Comments and Attributes */}
                  <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                    {/* Student Comment */}
                    {latestClass.student_feedback && (
                      <Card className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-semibold">Seu Comentário</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{latestClass.student_feedback}</p>
                      </Card>
                    )}

                    {/* Teacher Answer */}
                    {latestClass.teacher_answer && (
                      <Card className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-semibold">Resposta do Professor</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{latestClass.teacher_answer}</p>
                      </Card>
                    )}

                    {/* Attributes */}
                    <Card className="p-4 space-y-3">
                      <h4 className="text-sm font-semibold">Atributos da Aula</h4>
                      <div className="space-y-2 text-sm">
                        {latestClass.watched && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Aula assistida</span>
                          </div>
                        )}
                        {latestClass.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span>Avaliação: {latestClass.rating}/5</span>
                          </div>
                        )}
                        {latestClass.exercise_id && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary" />
                            <span>Exercício: {latestClass.exercise_score} pontos</span>
                          </div>
                        )}
                        {!latestClass.watched && !latestClass.rating && !latestClass.exercise_id && (
                          <p className="text-muted-foreground text-xs">Nenhum atributo registrado</p>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="border-dashed">
                  <div className="p-10 text-center space-y-2">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="font-semibold">Selecione uma data</p>
                    <p className="text-sm text-muted-foreground">Clique em uma data no calendário para ver as aulas</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
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
