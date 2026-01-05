"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  ChevronRight,
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
import { LogoPulseLoader } from "@/components/shared/logo-loader";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useSubscriptions } from "@/src/features/dashboard/hooks/useSubscription";
import { useAllLiveClasses } from "@/src/features/dashboard/hooks/useAllLiveClasses";
import {
  getFlagFromCourseName,
  getFlagFromLanguageMetadata,
  getFlagFromCountryCode,
} from "@/src/utils/languageFlags";

// Assume as correções: comentários/aluno e resposta/professor vêm de feedbacks: { aluno: string, professor: string } ou similar

export default function MinhasAulasPage() {
  const router = useRouter();
  const { data: subscriptions, loading, error } = useSubscriptions();
  const {
    data: allLiveClasses,
    isLoading: loadingAllClasses,
    error: allClassesError,
  } = useAllLiveClasses(subscriptions);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [expandedPastClassId, setExpandedPastClassId] = useState<string | null>(null);

  // CORREÇÃO: Função segura para pegar feedback do aluno e do professor
  const getFeedbackFields = (liveClass: any) => {
    // aceita feedbacks aninhados em um objeto, ou legacy direto no objeto
    // preferencialmente usa o campo 'feedback' de liveClass se existir, senão tenta campos avulsos legacy
    let student_feedback = "";
    let teacher_answer = "";
    if (liveClass.feedback && typeof liveClass.feedback === "object") {
      student_feedback = liveClass.feedback.student || "";
      teacher_answer = liveClass.feedback.teacher || "";
    } else {
      // fallback legacy
      student_feedback = liveClass.student_feedback || "";
      teacher_answer = liveClass.teacher_answer || "";
    }
    return { student_feedback, teacher_answer };
  };

  // Convert emoji flag to country code
  const flagEmojiToCountryCode = (flag: string): string | null => {
    if (!flag || flag.length < 2) return null;
    const codePoints = [...flag].map(char => char.codePointAt(0));
    if (codePoints.length !== 2) return null;
    const countryCode = codePoints
      .map(cp => {
        if (!cp) return '';
        return String.fromCharCode(cp - 127397);
      })
      .join('');
    return countryCode.length === 2 ? countryCode.toLowerCase() : null;
  };

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
      date: formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1).replace(".", ""),
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

  // Calendário
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

  const selectedDateClasses = sortedAllLiveClasses.filter((liveClass) => {
    const classDate = new Date(liveClass.event.scheduled_datetime);
    return (
      classDate.getFullYear() === selectedDate.getFullYear() &&
      classDate.getMonth() === selectedDate.getMonth() &&
      classDate.getDate() === selectedDate.getDate()
    );
  });

  // Card das aulas
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
    const timeUntil = upcoming ? getTimeUntilClass(liveClass.event.scheduled_datetime) : "";
    const dateTime = formatDateTime(liveClass.event.scheduled_datetime);

    // Extra: badge do idioma do curso
    const languageBadge =
      (liveClass.event.language && (
        <Badge variant="outline" className="gap-1 text-[10px] h-5 px-2">
          {getFlagFromLanguageMetadata(liveClass.event) || "🌐"}
          {liveClass.event.language?.toUpperCase()}
        </Badge>
      )) ||
      null;

    return (
      <Card
        className={cn(
          "border transition-all hover:shadow-lg group overflow-hidden bg-card/60 backdrop-blur-sm relative",
          upcoming && "hover:border-primary/50",
          isNextClass && "ring-2 ring-primary shadow-lg"
        )}
      >
        {/* Lateral colorida para indicar próxima aula */}
        {isNextClass && (
          <span
            className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-md animate-pulse"
            style={{ zIndex: 10 }}
            aria-hidden
          />
        )}
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
                    className="h-7 w-7 rounded object-cover shadow"
                  />
                  <p className="text-base font-semibold line-clamp-1">
                    {liveClass.course.course_name}
                  </p>
                </div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Módulo {liveClass.event.module.order}
                </p>
                {/* Badge de idioma no topo esquerdo do card */}
                {languageBadge}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {upcoming && timeUntil && (
                <Badge
                  variant={isNextClass ? "default" : "secondary"}
                  className={cn(
                    "h-5 text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded-full shadow-sm",
                    isNextClass && "shadow-primary/30"
                  )}
                  title={isNextClass ? "Sua próxima aula!" : undefined}
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
            <p className="text-xs text-muted-foreground line-clamp-2">
              {liveClass.event.module.name}
            </p>
          </div>

          {/* Date and Time pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-inner">
            <CalendarIcon className="h-3 w-3" />
            <span>{dateTime.date}</span>
            <span className="w-px h-3 bg-border mx-1" />
            <Clock className="h-3 w-3" />
            <span>{dateTime.time}</span>
          </div>

          {/* Status Badges */}
          {(liveClass.watched || liveClass.rating || liveClass.exercise_id) && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {liveClass.watched && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-[10px] h-5 px-2"
                  title="Aula assistida"
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Assistida
                </Badge>
              )}
              {liveClass.rating && (
                <Badge variant="outline" className="gap-1 text-[10px] h-5 px-2" title="Avaliação da aula">
                  <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                  {liveClass.rating}/5
                </Badge>
              )}
              {liveClass.exercise_id && (
                <Badge variant="outline" className="gap-1 text-[10px] h-5 px-2" title="Pontuação de exercício">
                  <Award className="h-2.5 w-2.5 text-primary" />
                  {liveClass.exercise_score}pts
                </Badge>
              )}
            </div>
          )}

          {/* Notice */}
          {liveClass.event.class_notice && (
            <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 mt-2">
              <AlertCircle className="h-4 w-4 mt-[1px] flex-shrink-0 text-amber-500" />
              <span className="text-xs leading-relaxed text-amber-900 dark:text-amber-100 line-clamp-2">
                {liveClass.event.class_notice}
              </span>
            </div>
          )}

          {/* Actions */}
          {((upcoming && liveClass.event.classroom_link) ||
            (past && liveClass.event.event_recorded_link)) && (
            <div className="pt-1 flex flex-wrap items-center gap-2">
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
                title="Ver detalhes da sua aula"
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
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm shadow-md">
            <div className="flex flex-wrap items-center gap-4 p-4">
              <Badge variant="default" className="gap-1.5 px-3 py-1.5 text-xs font-semibold shadow-lg animate-pulse">
                <Bell className="h-3.5 w-3.5" />
                Próxima aula
              </Badge>
              <span className="font-semibold text-base text-foreground">
                {formatDateTime(nextClass.event.scheduled_datetime).date} às{" "}
                {formatDateTime(nextClass.event.scheduled_datetime).time}
              </span>
              <span className="text-sm text-primary font-medium">
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
            {/* Calendar Section with Selected Date Classes */}
            <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
              {/* Calendar */}
              <div className="mx-auto lg:mx-0">
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
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                        } else {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          setSelectedDate(today);
                        }
                      }}
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

                          // Get unique country codes for this date (for flag images)
                          const countryCodes = classesForDate
                            ? Array.from(new Set(
                                classesForDate
                                  .map((liveClass) => {
                                    const flag =
                                      getFlagFromLanguageMetadata(liveClass.event) ||
                                      getFlagFromCourseName(liveClass.course.course_name);
                                    return flag ? flagEmojiToCountryCode(flag) : null;
                                  })
                                  .filter(Boolean)
                              )).slice(0, 2)
                            : [];

                          return (
                            <CalendarDayButton day={day} {...props}>
                              {day.date.getDate()}
                              {/* Today indicator */}
                              {isToday && (
                                <div className="absolute top-0 right-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" />
                                </div>
                              )}
                              {/* Flag images for non-today dates with classes */}
                              {!isToday && hasClasses && countryCodes.length > 0 && (
                                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                                  {countryCodes.map((code, idx) => (
                                    <img
                                      key={idx}
                                      src={`https://flagcdn.com/w20/${code}.png`}
                                      alt=""
                                      className="w-3 h-2 object-cover rounded-[1px]"
                                    />
                                  ))}
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

              {/* Selected Date Classes */}
              <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
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
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isToday = selectedDate.getTime() === today.getTime();
                    return !isToday ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newToday = new Date();
                          newToday.setHours(0, 0, 0, 0);
                          setSelectedDate(newToday);
                        }}
                        className="h-8 text-xs hover:bg-accent transition-colors"
                        title="Voltar para hoje"
                      >
                        Voltar para hoje
                      </Button>
                    ) : null;
                  })()}
                </div>

                {selectedDateClasses.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedDateClasses.map((liveClass, index) => (
                      <div
                        key={`${liveClass.event.id}-${liveClass.student_class_id}`}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        {renderClassCard(liveClass)}
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
            </div>

            {/* Upcoming Classes Carousel */}
            {upcomingClasses.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Próximas Aulas</h2>
                  <Badge variant="outline" className="ml-2">
                    {upcomingClasses.length}{" "}
                    {upcomingClasses.length === 1
                      ? "aula agendada"
                      : "aulas agendadas"}
                  </Badge>
                </div>
                <div className="relative px-2 md:px-12">
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
                              "border transition-all hover:shadow-lg overflow-hidden bg-card/60 backdrop-blur-sm h-full relative",
                              "hover:border-primary/50",
                              isNextClass && "ring-2 ring-primary shadow-md"
                            )}>
                              {/* Lateral do card: highlight só na próxima aula */}
                              {isNextClass && (
                                <span
                                  className="absolute left-0 top-0 h-full w-1.5 bg-primary rounded-r-md animate-pulse"
                                  style={{ zIndex: 9 }}
                                />
                              )}
                              <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl flex-shrink-0">{flag}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold truncate">
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
                                  href={liveClass.event.classroom_link || `/aula/${liveClass.event.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md",
                                    "bg-primary text-primary-foreground hover:bg-primary/90",
                                    "transition-colors font-medium text-sm ring-primary/30 ring-1 hover:ring-2"
                                  )}
                                >
                                  <Camera className="h-4 w-4" />
                                  {liveClass.event.classroom_link
                                    ? "Entrar na aula"
                                    : "Acessar Aula"}
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </Card>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>
                    {upcomingClasses.length > 3 && (
                      <>
                        <CarouselPrevious />
                        <CarouselNext />
                      </>
                    )}
                  </Carousel>
                </div>
              </div>
            )}

            {/* Past Classes Carousel */}
            {pastClasses.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Aulas Passadas</h2>
                  <Badge variant="outline" className="ml-2">
                    {pastClasses.length}{' '}
                    {pastClasses.length === 1 ? "aula realizada" : "aulas realizadas"}
                  </Badge>
                </div>
                <div className="relative px-2 md:px-12">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                      {pastClasses.slice(0, 10).map((liveClass) => {
                        const rawFlag =
                          getFlagFromLanguageMetadata(liveClass.event) ||
                          getFlagFromCourseName(liveClass.course.course_name) ||
                          "🌐";
                        const trimmedFlag = typeof rawFlag === "string" ? rawFlag.trim() : rawFlag;
                        const flag =
                          /^[A-Za-z]{2}$/.test(trimmedFlag)
                            ? getFlagFromCountryCode(trimmedFlag) || "🌐"
                            : rawFlag;
                        const dateTime = formatDateTime(liveClass.event.scheduled_datetime);
                        const classId = `${liveClass.event.id}-${liveClass.student_class_id}`;
                        const isExpanded = expandedPastClassId === classId;
                        // Corrigir acesso a comentários/anotações
                        const { student_feedback, teacher_answer } = getFeedbackFields(liveClass);
                        const hasFeedback = Boolean(student_feedback) || Boolean(teacher_answer);

                        return (
                          <CarouselItem key={classId} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="space-y-2">
                              <button
                                onClick={() => setExpandedPastClassId(isExpanded ? null : classId)}
                                className={cn(
                                  "w-full text-left p-4 rounded-lg bg-card border border-border transition-all relative overflow-hidden",
                                  "hover:border-primary/50 hover:shadow-lg",
                                  isExpanded && "ring-2 ring-primary"
                                )}
                                style={{ minHeight: hasFeedback ? 112 : 72 }}
                                aria-expanded={isExpanded}
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl flex-shrink-0">{flag}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold truncate">
                                      {liveClass.course.course_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {dateTime.date} • {dateTime.time}
                                    </p>
                                    {hasFeedback && (
                                      <p className="text-[10px] text-primary mt-2 flex items-center gap-1 transition-colors">
                                        <MessageSquare className="h-3 w-3" />
                                        {isExpanded ? "Ocultar" : "Ver"} comentários
                                      </p>
                                    )}
                                  </div>
                                  {liveClass.watched && (
                                    <CheckCircle2
                                      className="h-4 w-4 text-success flex-shrink-0"
                                      title="Aula assistida"
                                    />
                                  )}
                                </div>
                              </button>

                              {isExpanded && hasFeedback && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top duration-200">
                                  {student_feedback && (
                                    <div className="p-3 rounded-lg bg-accent border border-border">
                                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5 text-muted-foreground">
                                        Seu comentário
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {student_feedback}
                                      </p>
                                    </div>
                                  )}
                                  {teacher_answer && (
                                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1.5">
                                        Resposta do professor
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {teacher_answer}
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
                    {pastClasses.slice(0, 10).length > 3 && (
                      <>
                        <CarouselPrevious />
                        <CarouselNext />
                      </>
                    )}
                  </Carousel>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
