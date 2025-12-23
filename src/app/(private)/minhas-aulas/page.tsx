"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  ChevronRight,
  Clock,
  Video,
  Calendar as CalendarIcon,
  ExternalLink,
  Award,
  CheckCircle2,
  Star,
  Bell,
  Users,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogoPulseLoader } from "@/components/shared/logo-loader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";
import { useSubscriptions } from "@/src/features/dashboard/hooks/useSubscription";
import { useAllLiveClasses } from "@/src/features/dashboard/hooks/useAllLiveClasses";
import {
  getFlagFromCourseName,
  getFlagFromLanguageMetadata,
} from "@/src/utils/languageFlags";

export default function MinhasAulasPage() {
  const router = useRouter();
  const { data: subscriptions, loading, error } = useSubscriptions();
  const {
    data: allLiveClasses,
    isLoading: loadingAllClasses,
    error: allClassesError,
  } = useAllLiveClasses(subscriptions);

  // Set selected date to today by default
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    const formattedTime = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      date:
        formattedDate.charAt(0).toUpperCase() +
        formattedDate.slice(1).replace(".", ""),
      time: formattedTime,
    };
  };

  const isUpcoming = (dateTimeString: string) =>
    new Date(dateTimeString) > new Date();

  const getTimeUntilClass = (dateTimeString: string): string => {
    const classDate = new Date(dateTimeString);
    const now = new Date();
    const diffMs = classDate.getTime() - now.getTime();

    if (diffMs < 0) return "";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0)
      return `Em ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
    if (diffHours > 0)
      return `Em ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    return "Em breve";
  };

  const sortedAllLiveClasses = allLiveClasses
    ? [...allLiveClasses].sort((a, b) => {
        const now = new Date();
        const aDate = new Date(a.event.scheduled_datetime);
        const bDate = new Date(b.event.scheduled_datetime);

        const aUpcoming = aDate > now;
        const bUpcoming = bDate > now;

        if (aUpcoming && bUpcoming) return aDate.getTime() - bDate.getTime();
        if (!aUpcoming && !bUpcoming) return bDate.getTime() - aDate.getTime();
        return aUpcoming ? -1 : 1;
      })
    : [];

  const upcomingClasses = sortedAllLiveClasses.filter((liveClass) =>
    isUpcoming(liveClass.event.scheduled_datetime)
  );
  const pastClasses = sortedAllLiveClasses.filter(
    (liveClass) => !isUpcoming(liveClass.event.scheduled_datetime)
  );
  const nextClass = upcomingClasses[0];
  const latestClass = pastClasses[0];

  // Get dates with classes and their flags for calendar highlighting
  const dateClassMap = new Map<string, typeof sortedAllLiveClasses>();
  sortedAllLiveClasses.forEach((liveClass) => {
    const date = new Date(liveClass.event.scheduled_datetime);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split("T")[0];

    if (!dateClassMap.has(dateKey)) {
      dateClassMap.set(dateKey, []);
    }
    dateClassMap.get(dateKey)!.push(liveClass);
  });

  const datesWithClasses = Array.from(dateClassMap.keys()).map(
    (dateKey) => new Date(dateKey)
  );

  const selectedDateClasses = selectedDate
    ? sortedAllLiveClasses.filter((liveClass) => {
        const classDate = new Date(liveClass.event.scheduled_datetime);
        return (
          classDate.getFullYear() === selectedDate.getFullYear() &&
          classDate.getMonth() === selectedDate.getMonth() &&
          classDate.getDate() === selectedDate.getDate()
        );
      })
    : [];

  const renderClassCard = (
    liveClass: (typeof sortedAllLiveClasses)[number],
    isNextClass: boolean = false
  ) => {
    const upcoming = isUpcoming(liveClass.event.scheduled_datetime);
    const past = !upcoming;
    const flag =
      getFlagFromLanguageMetadata(liveClass.event) ||
      getFlagFromCourseName(liveClass.course.course_name) ||
      "🌐";
    const timeUntil = upcoming
      ? getTimeUntilClass(liveClass.event.scheduled_datetime)
      : "";

    const dateTime = formatDateTime(liveClass.event.scheduled_datetime);

    return (
      <Card
        className={cn(
          "border transition-all hover:shadow-md group overflow-hidden bg-card/60 backdrop-blur-sm",
          upcoming && "hover:border-primary/50",
          isNextClass && "ring-2 ring-primary shadow-lg"
        )}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl leading-none flex-shrink-0">
                {flag}
              </span>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src={liveClass.course.course_icon}
                    alt={liveClass.course.course_name}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded object-cover"
                  />
                  <p className="text-sm font-semibold line-clamp-1">
                    {liveClass.course.course_name}
                  </p>
                </div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Módulo {liveClass.event.module.order}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {upcoming && timeUntil && (
                <Badge
                  variant={isNextClass ? "default" : "secondary"}
                  className="h-5 text-[10px] font-semibold flex items-center gap-1"
                >
                  {isNextClass ? (
                    <>
                      <Bell className="h-3 w-3" />
                      Próxima
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      {timeUntil}
                    </>
                  )}
                </Badge>
              )}

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
          </div>

          {/* Lesson Title */}
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {liveClass.event.lesson.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {liveClass.event.module.name}
            </p>
          </div>

          {/* Date and Time pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <CalendarIcon className="h-3 w-3" />
            <span>{dateTime.date}</span>
            <span className="w-px h-3 bg-border mx-1" />
            <Clock className="h-3 w-3" />
            <span>{dateTime.time}</span>
          </div>

          {/* Status Badges */}
          {(liveClass.watched || liveClass.rating || liveClass.exercise_id) && (
            <div className="flex flex-wrap gap-1.5">
              {liveClass.watched && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10px] h-5 px-2"
                >
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
              <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-100 line-clamp-2 flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 mt-[1px] flex-shrink-0" />
                <span>{liveClass.event.class_notice}</span>
              </p>
            </div>
          )}

          {/* Actions */}
          {((upcoming && liveClass.event.classroom_link) ||
            (past && liveClass.event.event_recorded_link)) && (
            <div className="pt-1 flex items-center gap-2">
              {upcoming && liveClass.event.classroom_link && (
                <Button
                  className="flex-1 gap-2 h-9 text-sm font-semibold"
                  asChild
                >
                  <a
                    href={liveClass.event.classroom_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="h-3.5 w-3.5" />
                    Entrar na aula
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </a>
                </Button>
              )}

              {past && liveClass.event.event_recorded_link && (
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-9 text-sm font-medium"
                  asChild
                >
                  <a
                    href={liveClass.event.event_recorded_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Assistir gravação
                  </a>
                </Button>
              )}

              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9"
                onClick={() =>
                  router.push(`/minhas-aulas/${liveClass.student_class_id}`)
                }
                title="Ver detalhes do curso"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LogoPulseLoader label="Carregando seus cursos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-destructive">
          Erro ao carregar cursos: {error.message}
        </p>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground">Nenhum curso encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-4 pt-8">
        <div className="space-y-2">
         <div className="flex items-center gap-4">
           <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            Minhas Aulas{" "}
          </h1>
            <Badge
              variant="default"
              className="gap-2 px-3 py-1.5 text-xs font-medium"
            >
              <Users className="h-3.5 w-3.5" />
              {sortedAllLiveClasses.length}{" "}
              {sortedAllLiveClasses.length === 1 ? "aula" : "aulas"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Acompanhe e acesse todas as aulas ao vivo dos cursos em que você
            está inscrito.
          </p>
        </div>

        {nextClass && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1 px-2 py-1 text-xs">
              <Bell className="h-3.5 w-3.5" />
              Próxima aula
            </Badge>
            <span className="font-medium">
              {formatDateTime(nextClass.event.scheduled_datetime).date} às{" "}
              {formatDateTime(nextClass.event.scheduled_datetime).time}
            </span>
            <span className="text-xs text-muted-foreground/80">
              ({getTimeUntilClass(nextClass.event.scheduled_datetime)})
            </span>
          </div>
        )}
      </div>

      <div className="border-t pt-6 space-y-6">
        {/* Calendar View */}
        <div className="space-y-6">
          {loadingAllClasses ? (
            <div className="flex items-center justify-center h-48">
              <LogoPulseLoader label="Carregando aulas ao vivo..." />
            </div>
          ) : allClassesError ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-destructive">
                Erro ao carregar aulas: {allClassesError.message}
              </p>
            </div>
          ) : !allLiveClasses || allLiveClasses.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-muted-foreground">
                Nenhuma aula ao vivo agendada
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[auto_2fr] gap-8">
              {/* Calendar Section */}
              <Card className="border shadow-sm bg-card h-fit mx-auto lg:mx-0">
                <div className="p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    components={{
                      DayButton: ({ day, ...props }) => {
                        const dateKey = day.date.toISOString().split("T")[0];
                        const classesForDate = dateClassMap.get(dateKey);

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const currentDate = new Date(day.date);
                        currentDate.setHours(0, 0, 0, 0);

                        const isToday = currentDate.getTime() === today.getTime();
                        const isFuture = currentDate.getTime() > today.getTime();

                        const indicatorColor = isToday
                          ? "bg-green-500"
                          : isFuture
                            ? "bg-amber-400"
                            : "bg-muted-foreground/40";

                        const shouldPulse = isToday || isFuture;

                        return (
                          <CalendarDayButton day={day} {...props}>
                            {day.date.getDate()}
                            {classesForDate && classesForDate.length > 0 && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                                <span
                                  className={cn(
                                    "block h-2 w-2 rounded-full",
                                    indicatorColor,
                                    shouldPulse && "animate-pulse"
                                  )}
                                />
                              </div>
                            )}
                          </CalendarDayButton>
                        );
                      },
                    }}
                  />
                </div>
              </Card>

              {/* Selected Date Classes or Latest/Lists */}
              <div className="space-y-5">
                {selectedDate && selectedDateClasses.length > 0 ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold tracking-tight">
                          {selectedDate.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedDateClasses.length}{" "}
                          {selectedDateClasses.length === 1
                            ? "aula encontrada"
                            : "aulas encontradas"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDate(undefined)}
                        className="h-8 text-xs hover:bg-accent transition-colors"
                      >
                        Limpar seleção
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {selectedDateClasses.map((liveClass, index) => (
                        <div
                          key={`${liveClass.event.id}-${liveClass.student_class_id}`}
                          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {renderClassCard(liveClass)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedDate && selectedDateClasses.length === 0 ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold tracking-tight">
                          {selectedDate.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDate(undefined)}
                        className="h-8 text-xs hover:bg-accent transition-colors"
                      >
                        Limpar seleção
                      </Button>
                    </div>
                    <Card className="border-dashed border-2">
                      <div className="p-12 text-center space-y-3">
                        <div className="inline-flex p-3 rounded-full bg-muted/50">
                          <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-base">
                            Nenhuma aula ao vivo agendada
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Não há aulas programadas para esta data.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Tabs defaultValue="past" className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold tracking-tight">
                            Suas aulas
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Veja próximas e aulas que já aconteceram.
                          </p>
                        </div>
                        <TabsList>
                          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
                          <TabsTrigger value="past">Passadas</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="upcoming" className="space-y-3">
                        {upcomingClasses.length === 0 ? (
                          <Card className="border-dashed">
                            <div className="p-8 text-center space-y-2">
                              <p className="font-medium">Nenhuma aula futura</p>
                              <p className="text-sm text-muted-foreground">
                                Assim que novas aulas forem agendadas,
                                aparecerão aqui.
                              </p>
                            </div>
                          </Card>
                        ) : (
                          <div className="grid gap-4 sm:grid-cols-2">
                            {upcomingClasses.map((liveClass, index) => (
                              <div
                                key={`${liveClass.event.id}-${liveClass.student_class_id}`}
                                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                                style={{ animationDelay: `${index * 40}ms` }}
                              >
                                {renderClassCard(liveClass, index === 0)}
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="past" className="space-y-4">
                        {latestClass && (
                          <div className="space-y-4 max-w-2xl">
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold tracking-tight">
                                Última aula
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Detalhes da aula mais recente que já aconteceu.
                              </p>
                            </div>
                            {renderClassCard(latestClass)}
                            <div className="grid gap-4 sm:grid-cols-2">
                              {latestClass.student_feedback && (
                                <Card className="p-4 space-y-3 border-0 shadow-sm bg-card/60 backdrop-blur-sm">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                      <MessageSquare className="h-4 w-4 text-primary" />
                                    </div>
                                    <h5 className="text-sm font-semibold tracking-tight">
                                      Seu comentário
                                    </h5>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {latestClass.student_feedback}
                                  </p>
                                </Card>
                              )}

                              {latestClass.teacher_answer && (
                                <Card className="p-4 space-y-3 border-0 shadow-sm bg-card/60 backdrop-blur-sm">
                                  <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                      <MessageSquare className="h-4 w-4 text-primary" />
                                    </div>
                                    <h5 className="text-sm font-semibold tracking-tight">
                                      Resposta do professor
                                    </h5>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {latestClass.teacher_answer}
                                  </p>
                                </Card>
                              )}

                              <Card className="p-4 space-y-3 border-0 shadow-sm bg-card/60 backdrop-blur-sm sm:col-span-2">
                                <h5 className="text-sm font-semibold tracking-tight">
                                  Resumo da aula
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <ul className="space-y-1.5">
                                    {latestClass.watched && (
                                      <li className="flex items-center gap-2 text-green-600 dark:text-green-300">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Aula assistida</span>
                                      </li>
                                    )}
                                    {latestClass.rating && (
                                      <li className="flex items-center gap-2 text-yellow-600 dark:text-yellow-300">
                                        <Star className="h-4 w-4" />
                                        <span>
                                          Avaliação: {latestClass.rating}/5
                                        </span>
                                      </li>
                                    )}
                                    {latestClass.exercise_id && (
                                      <li className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-primary" />
                                        <span>
                                          Exercício:{" "}
                                          {latestClass.exercise_score} pontos
                                        </span>
                                      </li>
                                    )}
                                    {!latestClass.watched &&
                                      !latestClass.rating &&
                                      !latestClass.exercise_id && (
                                        <li className="text-xs text-muted-foreground">
                                          Nenhum atributo registrado.
                                        </li>
                                      )}
                                  </ul>
                                </div>
                              </Card>
                            </div>
                          </div>
                        )}

                        {!latestClass && (
                          <Card className="border-dashed">
                            <div className="p-8 text-center space-y-2">
                              <p className="font-medium">
                                Nenhuma aula passada
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Assim que você participar de aulas, elas
                                aparecerão aqui.
                              </p>
                            </div>
                          </Card>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6 space-y-6">
        {/* Course Cards Grid */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight">
            Cursos Inscritos
          </h2>
          <p className="text-sm text-muted-foreground">
            Acesse rapidamente as aulas dos seus cursos.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((subscription, index) => {
            const totalLessons = subscription.total_lessons ?? 0;
            const watchedLessons = subscription.watched_lessons ?? 0;
            const progress =
              totalLessons > 0 ? (watchedLessons / totalLessons) * 100 : 0;

            const isActive = subscription.status === "active";

            return (
              <Card
                key={subscription.id}
                className={cn(
                  "group border-0 shadow-sm bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-4",
                  !isActive && "opacity-80"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() =>
                  router.push(`/minhas-aulas/${subscription.student_class_id}`)
                }
              >
                <div className="p-6 space-y-5">
                  {/* Course Icon and Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Image
                        src={subscription.course_icon}
                        alt={subscription.course_name}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-xl object-cover ring-2 ring-border/40 group-hover:ring-primary/40 transition-all"
                      />
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {subscription.course_name}
                      </h3>
                      <Badge
                        variant={isActive ? "secondary" : "outline"}
                        className="text-xs font-medium"
                      >
                        {isActive ? "Ativo" : subscription.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress + CTA */}
                  <div className="space-y-3">
                    {totalLessons > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {watchedLessons}/{totalLessons} aulas concluídas
                          </span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full gap-2 h-10 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/minhas-aulas/${subscription.student_class_id}`
                        );
                      }}
                    >
                      <span>Acessar aulas</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
