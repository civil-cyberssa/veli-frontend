"use client"

import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, Video, CheckCircle2, Star, MessageSquare, ArrowLeft, PlayCircle, FileText, Award, Sparkles } from "lucide-react"
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
    <div className="pb-12 space-y-10">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          className="w-fit gap-2 hover:bg-muted/50 transition-colors"
          onClick={() => router.push('/minhas-aulas')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para meus cursos
        </Button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 shadow-lg shadow-primary/5">
            <Video className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Aulas ao Vivo
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              Acompanhe sua jornada de aprendizado
            </p>
          </div>
        </div>
      </div>

      {/* Latest Class Section */}
      {latestClass && (
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-card via-card to-muted/20">
          {/* Gradient Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />

          <div className="relative p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 border border-emerald-500/20 shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="font-bold text-2xl">Última Aula Assistida</h2>
                <p className="text-sm text-muted-foreground font-medium">Continue de onde parou</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 space-y-5">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Módulo</p>
                    <p className="text-base font-semibold text-foreground/90">{latestClass.event.module.name}</p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aula</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {latestClass.event.lesson.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 w-fit">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">
                      {formatDateTime(latestClass.event.scheduled_datetime).date} às{' '}
                      {formatDateTime(latestClass.event.scheduled_datetime).time}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {latestClass.watched && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 px-3 py-1.5 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Concluída
                    </Badge>
                  )}
                  {latestClass.rating && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 px-3 py-1.5 text-sm font-semibold">
                      <Star className="h-4 w-4 mr-1.5 fill-current" />
                      {latestClass.rating}/5
                    </Badge>
                  )}
                </div>
              </div>

              {latestClass.comment && (
                <div className="pt-5 border-t border-border/50">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Seu Comentário</p>
                      <p className="text-base leading-relaxed">{latestClass.comment}</p>
                    </div>
                  </div>
                </div>
              )}

              {latestClass.teacher_answer && (
                <div className="pt-5 border-t border-border/50">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">Resposta do Professor</p>
                      <p className="text-base leading-relaxed">{latestClass.teacher_answer}</p>
                    </div>
                  </div>
                </div>
              )}

              {latestClass.exercise_id && (
                <div className="pt-5 border-t border-border/50">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-background/50">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-base font-bold">Exercício Concluído</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-base font-bold">
                      {latestClass.exercise_score} pontos
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Live Classes List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 shadow-lg shadow-primary/5">
            <PlayCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-2xl">Próximas Aulas</h2>
            <p className="text-sm text-muted-foreground font-medium">Sua agenda de aulas ao vivo</p>
          </div>
        </div>

        {!liveClasses || liveClasses.length === 0 ? (
          <Card className="p-16 text-center border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/20">
            <div className="flex flex-col items-center gap-4">
              <div className="p-5 rounded-full bg-muted/50">
                <Video className="h-12 w-12 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-muted-foreground">Nenhuma aula ao vivo agendada</p>
                <p className="text-sm text-muted-foreground/70">Novas aulas serão adicionadas em breve</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {liveClasses.map((liveClass, index) => {
              const upcoming = isUpcoming(liveClass.event.scheduled_datetime)
              const past = isPast(liveClass.event.scheduled_datetime)

              return (
                <Card
                  key={liveClass.event.id}
                  className={cn(
                    "group relative overflow-hidden border-0 shadow-lg transition-all duration-500",
                    "bg-gradient-to-br from-card via-card to-muted/20",
                    upcoming && "hover:shadow-xl hover:-translate-y-1"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                    opacity: 0,
                  }}
                >
                  {/* Gradient Background Effect */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                    upcoming && "from-primary/10 via-transparent to-transparent group-hover:opacity-100",
                    past && "from-muted/20 via-transparent to-transparent"
                  )} />

                  {/* Shine Effect for upcoming classes */}
                  {upcoming && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  )}

                  <div className="relative p-7 space-y-5">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2.5 rounded-xl shadow-lg transition-all duration-300",
                            upcoming && "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:scale-110",
                            past && "bg-muted border border-border/50"
                          )}>
                            <PlayCircle className={cn(
                              "h-5 w-5",
                              upcoming && "text-primary",
                              past && "text-muted-foreground"
                            )} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Módulo {liveClass.event.module.order}
                            </p>
                            <p className="text-base font-semibold">{liveClass.event.module.name}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                            {liveClass.event.lesson.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-background/50 border border-border/50 w-fit">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">
                            {formatDateTime(liveClass.event.scheduled_datetime).date} às{' '}
                            {formatDateTime(liveClass.event.scheduled_datetime).time}
                          </span>
                        </div>

                        {liveClass.event.class_notice && (
                          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                              {liveClass.event.class_notice}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        {upcoming && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm font-semibold whitespace-nowrap">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            Em breve
                          </Badge>
                        )}
                        {past && liveClass.watched && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 px-3 py-1.5 text-sm font-semibold whitespace-nowrap">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Assistida
                          </Badge>
                        )}
                        {liveClass.rating && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 px-3 py-1.5 text-sm font-semibold whitespace-nowrap">
                            <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                            {liveClass.rating}/5
                          </Badge>
                        )}
                        {liveClass.exercise_id && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm font-semibold whitespace-nowrap">
                            <Award className="h-3.5 w-3.5 mr-1.5" />
                            {liveClass.exercise_score}pts
                          </Badge>
                        )}
                      </div>
                    </div>

                    {upcoming && liveClass.event.classroom_link && (
                      <Button
                        className={cn(
                          "w-full h-12 font-bold text-base shadow-lg shadow-primary/25",
                          "bg-gradient-to-r from-primary to-primary/90",
                          "hover:shadow-xl hover:shadow-primary/30",
                          "transition-all duration-300 group/btn"
                        )}
                        asChild
                      >
                        <a href={liveClass.event.classroom_link} target="_blank" rel="noopener noreferrer">
                          <span className="flex items-center gap-2">
                            Entrar na aula ao vivo
                            <PlayCircle className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                          </span>
                        </a>
                      </Button>
                    )}

                    {past && liveClass.event.event_recorded_link && (
                      <Button
                        variant="outline"
                        className="w-full h-12 font-bold text-base border-2 hover:bg-muted/50 transition-all duration-300"
                        asChild
                      >
                        <a href={liveClass.event.event_recorded_link} target="_blank" rel="noopener noreferrer">
                          <span className="flex items-center gap-2">
                            Assistir gravação
                            <Video className="h-5 w-5" />
                          </span>
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

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
