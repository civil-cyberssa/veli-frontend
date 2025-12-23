"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Video,
  Camera,
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
  getFlagFromCountryCode,
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

  // State for expanded past class (to show comments)
  const [expandedPastClassId, setExpandedPastClassId] = useState<string | null>(null);

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

  // Custom day content renderer for flags
  const renderDayContent = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    const classesForDate = dateClassMap.get(dateKey);

    if (!classesForDate || classesForDate.length === 0) return null;

    // Get unique flags for this date (limit to 3)
    const flags = classesForDate
      .map(
        (liveClass) =>
          getFlagFromLanguageMetadata(liveClass.event) ||
          getFlagFromCourseName(liveClass.course.course_name)
      )
      .filter(Boolean)
      .filter((flag, index, self) => self.indexOf(flag) === index)
      .slice(0, 3);

    return (
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5">
        {flags.map((flag, index) => (
          <span key={index} className="text-[8px]">
            {flag}
          </span>
        ))}
      </div>
    );
  };

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
      <div className="space-y-6 pt-8 pb-2">
        <div className="space-y-3">
         <div className="flex items-center gap-4">
           <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            Minhas Aulas
          </h1>
            <Badge
              variant="secondary"
              className="gap-2 px-3.5 py-1.5 text-sm font-semibold shadow-sm"
            >
              <Users className="h-4 w-4" />
              {sortedAllLiveClasses.length}{" "}
              {sortedAllLiveClasses.length === 1 ? "aula" : "aulas"}
            </Badge>
          </div>
          <p className="text-muted-foreground/80 text-base max-w-3xl leading-relaxed">
            Acompanhe e acesse todas as aulas ao vivo dos cursos em que você está inscrito.
          </p>
        </div>

        {nextClass && (
          <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-4 p-4">
              <Badge variant="default" className="gap-1.5 px-3 py-1.5 text-xs font-semibold shadow-lg">
                <Bell className="h-3.5 w-3.5" />
                Próxima aula
              </Badge>
              <span className="font-semibold text-base text-foreground">
                {formatDateTime(nextClass.event.scheduled_datetime).date} às{" "}
                {formatDateTime(nextClass.event.scheduled_datetime).time}
              </span>
              <span className="text-sm text-muted-foreground/90 font-medium">
                {getTimeUntilClass(nextClass.event.scheduled_datetime)}
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
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
          <>
            {/* Calendar Section */}
            <div className="max-w-sm mx-auto lg:mx-0">
              <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-border/30">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    Calendário
                  </h3>
                </div>
                <div className="p-4">
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
                        const dateToCheck = new Date(day.date);
                        dateToCheck.setHours(0, 0, 0, 0);
                        const isToday = dateToCheck.getTime() === today.getTime();
                        const hasClasses = classesForDate && classesForDate.length > 0;

                        return (
                          <CalendarDayButton day={day} {...props}>
                            {day.date.getDate()}
                            {isToday && hasClasses && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                                <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-lg shadow-success/50" />
                              </div>
                            )}
                            {isToday && !hasClasses && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                                <div className="w-1 h-1 rounded-full bg-success/60" />
                              </div>
                            )}
                            {!isToday && hasClasses && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                                <div className="w-1 h-1 rounded-full bg-primary/60" />
                              </div>
                            )}
                          </CalendarDayButton>
                        );
                      },
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Upcoming Classes Carousel */}
            {upcomingClasses.length > 0 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">Próximas Aulas</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {upcomingClasses.length} {upcomingClasses.length === 1 ? "aula agendada" : "aulas agendadas"}
                  </p>
                </div>
                <div className="relative px-12">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                      {upcomingClasses.map((liveClass, index) => {
                        const flag =
                          getFlagFromLanguageMetadata(liveClass.event) ||
                          getFlagFromCourseName(liveClass.course.course_name) ||
                          "🌐";
                        const timeUntil = getTimeUntilClass(liveClass.event.scheduled_datetime);
                        const dateTime = formatDateTime(liveClass.event.scheduled_datetime);
                        const isNextClass = index === 0;

                        return (
                          <CarouselItem key={`${liveClass.event.id}-${liveClass.student_class_id}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <Card className={cn(
                              "border transition-all hover:shadow-lg overflow-hidden bg-card/60 backdrop-blur-sm h-full",
                              "hover:border-primary/50",
                              isNextClass && "ring-2 ring-primary shadow-lg"
                            )}>
                              <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl flex-shrink-0">{flag}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                      {liveClass.course.course_name}
                                    </p>
                                    {isNextClass && (
                                      <Badge variant="default" className="text-[10px] px-2 py-0.5 mt-1">
                                        Próxima
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-1.5 text-xs">
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    <span>{dateTime.date}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{dateTime.time}</span>
                                    {timeUntil && (
                                      <span className="text-primary font-semibold ml-auto">
                                        {timeUntil}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <a
                                  href={`/aula/${liveClass.event.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md",
                                    "bg-primary text-primary-foreground hover:bg-primary/90",
                                    "transition-colors font-medium text-sm"
                                  )}
                                >
                                  <Camera className="h-4 w-4" />
                                  Acessar Aula
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </Card>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              </div>
            )}

            {/* Past Classes Carousel */}
            {pastClasses.length > 0 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">Aulas Passadas</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pastClasses.length} {pastClasses.length === 1 ? "aula realizada" : "aulas realizadas"}
                  </p>
                </div>
                <div className="relative px-12">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                      {pastClasses.slice(0, 10).map((liveClass) => {
                        const rawFlag =
                          getFlagFromLanguageMetadata(liveClass.event) ||
                          getFlagFromCourseName(liveClass.course.course_name) ||
                          "🌐";
                        const trimmedFlag = rawFlag.trim();
                        const flag = /^[A-Za-z]{2}$/.test(trimmedFlag)
                          ? getFlagFromCountryCode(trimmedFlag) || "🌐"
                          : rawFlag;
                        const dateTime = formatDateTime(liveClass.event.scheduled_datetime);
                        const classId = `${liveClass.event.id}-${liveClass.student_class_id}`;
                        const isExpanded = expandedPastClassId === classId;

                        return (
                          <CarouselItem key={classId} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="space-y-2">
                              <button
                                onClick={() => setExpandedPastClassId(isExpanded ? null : classId)}
                                className="w-full text-left p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl flex-shrink-0">{flag}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                      {liveClass.course.course_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {dateTime.date} • {dateTime.time}
                                    </p>
                                    {(liveClass.student_feedback || liveClass.teacher_answer) && (
                                      <p className="text-[10px] text-primary mt-2 flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        {isExpanded ? "Ocultar" : "Ver"} comentários
                                      </p>
                                    )}
                                  </div>
                                  {liveClass.watched && (
                                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                                  )}
                                </div>
                              </button>

                              {isExpanded && (liveClass.student_feedback || liveClass.teacher_answer) && (
                                <div className="space-y-2 animate-in slide-in-from-top duration-200">
                                  {liveClass.student_feedback && (
                                    <div className="p-3 rounded-lg bg-accent border border-border">
                                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5">
                                        Seu comentário
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {liveClass.student_feedback}
                                      </p>
                                    </div>
                                  )}
                                  {liveClass.teacher_answer && (
                                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1.5">
                                        Resposta do professor
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {liveClass.teacher_answer}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              </div>
            )}
          </>
        )}
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
