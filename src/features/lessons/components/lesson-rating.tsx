"use client";

import { useEffect, useState } from "react";
import { Star, Check, Bookmark, MonitorCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { LessonHeader } from "./lesson-resources-icons";


interface Exercise {
  id: number;
  name: string;
  questions_count: number;
  answers_count: number;
}

interface LessonDescriptionCardProps {
  title?: string;
  description?: string;
  initialRating?: number | null;
  courseName?: string;
  isWatched?: boolean;
  isSaved?: boolean;
  onRatingChange?: (rating: number) => void;
  onMarkAsWatched?: () => void;
  onToggleSave?: () => void;
  disabled?: boolean;
  ratingDisabled?: boolean;
  watchProgress?: number;
  isMarkingWatched?: boolean;
  eventId?: number;
  exercise?: Exercise | null;
  exerciseScore?: number | null;
  supportMaterialUrl?: string;
  onOpenQuiz?: (eventId: number, exerciseName: string) => void;
}

export function LessonDescriptionCard({
  title = "Meu primeiro algoritmo",
  description = "Neste vídeo, aprendemos a criar nosso primeiro código no Scratch, s algoritmos, sequências lógicas de passos para resolver problemas. Programar envolve entender e processar dados para gerar saídas úteis, como nas redes sociais.",
  initialRating = null,
  courseName,
  isWatched = false,
  isSaved = false,
  onRatingChange,
  onMarkAsWatched,
  onToggleSave,
  disabled = false,
  ratingDisabled = false,
  watchProgress = 0,
  isMarkingWatched = false,
  eventId,
  exercise,
  exerciseScore,
  supportMaterialUrl,
  onOpenQuiz,
}: LessonDescriptionCardProps) {
  const [rating, setRating] = useState<number>(initialRating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [watched, setWatched] = useState(isWatched);
  const [saved, setSaved] = useState(isSaved);

  // Sincronizar estado local com prop, mas só permitir mudança de false para true
  useEffect(() => {
    if (isWatched && !watched) {
      setWatched(true);
    }
  }, [isWatched, watched]);

  useEffect(() => {
    setRating(initialRating || 0);
  }, [initialRating]);

  const handleRatingClick = (value: number) => {
    if (disabled || ratingDisabled) return;
    setRating(value);
    onRatingChange?.(value);
  };

  const handleMarkAsWatched = () => {
    if (disabled || watched) return; // Não permite desmarcar se já está assistida
    setWatched(true); // Sempre marca como true, nunca false
    onMarkAsWatched?.();
  };

  const completion = Math.min(100, Math.round(watchProgress * 100));
  const buttonSubtitle = watched
    ? "Concluída e salva no seu progresso"
    : completion >= 90
    ? "Marcando automaticamente ao atingir 90%"
    : "Será concluída automaticamente ao final";

  const handleToggleSave = () => {
    if (disabled) return;
    setSaved(!saved);
    onToggleSave?.();
  };

  return (
    <div className="space-y-6 p-2">
      {/* Título */}

      {/* Grid: Descrição à esquerda, Card de ações à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        {/* Coluna esquerda: Descrição */}

        <div>
            {courseName && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {courseName}
              </p>
            )}
            <LessonHeader
              title={title || ""}
              description={description || ""}
              eventId={eventId}
              exercise={exercise}
              exerciseScore={exerciseScore}
              supportMaterialUrl={supportMaterialUrl}
              onOpenQuiz={onOpenQuiz}
            />
        </div>

        {/* Coluna direita: Grid com ícones à esquerda e ações/rating à direita */}
        <div>


          {/* Card com Rating e Ações */}
          <div className="space-y-4">
          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={handleMarkAsWatched}
              disabled={disabled || watched || isMarkingWatched}
              data-tour="mark-watched"
              className={cn(
                "gap-3 transition-all flex-1 min-h-[3.25rem] justify-between items-center text-left",
                watched
                  ? "bg-success/10 border-success/30 text-success hover:bg-success/10 cursor-default"
                  : "cursor-pointer hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border",
                    watched
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-primary/30 bg-primary/5 text-primary"
                  )}
                >
                  {watched ? (
                    <Check className="h-4 w-4" />
                  ) : isMarkingWatched ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MonitorCheck className="h-4 w-4" />
                  )}
                </span>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {watched ? "Aula assistida" : "Marcar como assistida"}
                  </span>
                  <span className="text-[11px] text-muted-foreground" aria-live="polite">
                    {buttonSubtitle}
                  </span>
                </div>
              </div>

              {!watched && (
                <div className="flex items-center gap-2 w-28">
                  <span className="text-[11px] text-muted-foreground min-w-[2.5rem] text-right">
                    {completion}%
                  </span>
                  <Progress value={completion} className="h-1.5" />
                </div>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleSave}
              disabled={disabled}
              className={cn(
                "transition-all cursor-pointer h-10 w-10",
                saved &&
                  "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              )}
            >
              <Bookmark
                className={cn("h-5 w-5 text-primary", saved && "fill-current")}
              />
            </Button>
          </div>

          {/* Card de avaliação */}
          <div className="border-border/50">
            <div className="p-1 border border-border ">
              <h3 className="text-sm font-medium text-center text-foreground mb-6 bg-card p-4">
                O que você achou desta aula?
              </h3>

              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={disabled || ratingDisabled}
                    onClick={() => handleRatingClick(value)}
                    onMouseEnter={() => !(disabled || ratingDisabled) && setHoverRating(value)}
                    onMouseLeave={() => !(disabled || ratingDisabled) && setHoverRating(0)}
                    className={cn(
                      "group transition-all disabled:cursor-not-allowed disabled:opacity-50",
                      !(disabled || ratingDisabled) && "hover:scale-110 cursor-pointer"
                    )}
                    aria-label={`Avaliar com ${value} estrela${
                      value > 1 ? "s" : ""
                    }`}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-all duration-200",
                        value <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback textual da avaliação */}
              {rating > 0 && (
                <p className="text-xs text-center text-muted-foreground mt-4 animate-in fade-in slide-in-from-bottom-2">
                  {rating === 1 && "Precisa melhorar"}
                  {rating === 2 && "Poderia ser melhor"}
                  {rating === 3 && "Boa aula"}
                  {rating === 4 && "Muito boa!"}
                  {rating === 5 && "Excelente! 🎉"}
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
