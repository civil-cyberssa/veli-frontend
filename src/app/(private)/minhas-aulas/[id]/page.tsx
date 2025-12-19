"use client"

import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, Video, CheckCircle2, Star, ArrowLeft, PlayCircle, FileText, Award, ChevronRight, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { cn } from "@/lib/utils"
import { useLiveClassList } from "@/src/features/dashboard/hooks/useLiveClassList"
import { useLatestClass } from "@/src/features/dashboard/hooks/useLatestClass"

// Map course names to country flags
const getCountryFlag = (courseName: string): string => {
  const lowerCourseName = courseName.toLowerCase()

  if (lowerCourseName.includes('francês') || lowerCourseName.includes('frances')) return '🇫🇷'
  if (lowerCourseName.includes('inglês') || lowerCourseName.includes('ingles') || lowerCourseName.includes('english')) return '🇬🇧'
  if (lowerCourseName.includes('espanhol') || lowerCourseName.includes('spanish')) return '🇪🇸'
  if (lowerCourseName.includes('alemão') || lowerCourseName.includes('alemao') || lowerCourseName.includes('german')) return '🇩🇪'
  if (lowerCourseName.includes('italiano') || lowerCourseName.includes('italian')) return '🇮🇹'
  if (lowerCourseName.includes('português') || lowerCourseName.includes('portugues') || lowerCourseName.includes('portuguese')) return '🇵🇹'
  if (lowerCourseName.includes('japonês') || lowerCourseName.includes('japones') || lowerCourseName.includes('japanese')) return '🇯🇵'
  if (lowerCourseName.includes('chinês') || lowerCourseName.includes('chines') || lowerCourseName.includes('chinese')) return '🇨🇳'
  if (lowerCourseName.includes('coreano') || lowerCourseName.includes('korean')) return '🇰🇷'

  return '🌐' // Default globe emoji for unknown courses
}

export default function LiveClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const { data: liveClasses, isLoading: loadingLiveClasses, error: errorLiveClasses } = useLiveClassList(courseId)
  const { data: latestClass, isLoading: loadingLatestClass, error: errorLatestClass } = useLatestClass(courseId)

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
    const date = new Date(dateTimeString)
    const now = new Date()
    return date > now
  }

  const isPast = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    const now = new Date()
    return date < now
  }

  // Sort classes: upcoming first (chronological), then past (reverse chronological)
  const sortedClasses = liveClasses ? [...liveClasses].sort((a, b) => {
    const aDate = new Date(a.event.scheduled_datetime)
    const bDate = new Date(b.event.scheduled_datetime)
    const now = new Date()

    const aIsUpcoming = aDate > now
    const bIsUpcoming = bDate > now

    // Both upcoming: sort ascending (soonest first)
    if (aIsUpcoming && bIsUpcoming) {
      return aDate.getTime() - bDate.getTime()
    }

    // Both past: sort descending (most recent first)
    if (!aIsUpcoming && !bIsUpcoming) {
      return bDate.getTime() - aDate.getTime()
    }

    // One upcoming, one past: upcoming comes first
    return aIsUpcoming ? -1 : 1
  }) : []

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
            Próximas aulas e aulas anteriores
          </p>
        </div>
      </div>

      {/* Carousel Layout */}
      {!sortedClasses || sortedClasses.length === 0 ? (
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
        <div className="space-y-6">
          {/* Carousel Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {sortedClasses.length} {sortedClasses.length === 1 ? 'Aula' : 'Aulas'}
            </h2>
          </div>

          {/* Carousel Container */}
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {sortedClasses.map((liveClass, index) => {
              const upcoming = isUpcoming(liveClass.event.scheduled_datetime)
              const past = isPast(liveClass.event.scheduled_datetime)
              const isNext = index === 0 && upcoming
              const flag = getCountryFlag(liveClass.event.module.name)

              return (
                <CarouselItem key={liveClass.event.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card
                    className={cn(
                      "border transition-all",
                      upcoming && "hover:border-primary/50",
                      isNext && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                  <div className="p-6 space-y-5">
                    {/* Flag and Quick Action */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl leading-none">{flag}</div>
                        <div className="space-y-0.5">
                          {isNext && (
                            <Badge className="mb-1">
                              Próxima aula
                            </Badge>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Módulo {liveClass.event.module.order}
                          </p>
                          <p className="text-sm font-medium line-clamp-1">
                            {liveClass.event.module.name}
                          </p>
                        </div>
                      </div>

                      {upcoming && liveClass.event.classroom_link && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 hover:bg-primary/10 flex-shrink-0"
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
                          className="h-9 w-9 p-0 hover:bg-primary/10 flex-shrink-0"
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
                      <p className="font-semibold text-lg leading-tight line-clamp-2">
                        {liveClass.event.lesson.name}
                      </p>
                    </div>

                    {/* Date and Time */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateTime(liveClass.event.scheduled_datetime).date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDateTime(liveClass.event.scheduled_datetime).time}</span>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {upcoming && !isNext && (
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
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                        <p className="text-xs text-amber-900 dark:text-amber-100 line-clamp-2">
                          {liveClass.event.class_notice}
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    {((upcoming && liveClass.event.classroom_link) || (past && liveClass.event.event_recorded_link)) && (
                      <div className="pt-2">
                        {upcoming && liveClass.event.classroom_link && (
                          <Button className="w-full gap-2 h-10" asChild>
                            <a href={liveClass.event.classroom_link} target="_blank" rel="noopener noreferrer">
                              Entrar na aula
                              <ChevronRight className="h-4 w-4" />
                            </a>
                          </Button>
                        )}

                        {past && liveClass.event.event_recorded_link && (
                          <Button variant="outline" className="w-full gap-2 h-10" asChild>
                            <a href={liveClass.event.event_recorded_link} target="_blank" rel="noopener noreferrer">
                              Ver gravação
                              <Video className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
                </CarouselItem>
              )
            })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      )}
    </div>
  )
}
