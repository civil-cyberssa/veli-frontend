"use client";

import { useState, useEffect } from "react";
import { Star, Check, Bookmark, MonitorCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonDescriptionCardProps {
  title?: string;
  description?: string;
  initialRating?: number | null;
  isWatched?: boolean;
  isSaved?: boolean;
  onRatingChange?: (rating: number) => void;
  onMarkAsWatched?: () => void;
  onToggleSave?: () => void;
  disabled?: boolean;
}

export function LessonDescriptionCard({
  title = "Meu primeiro algoritmo",
  description = "Neste vídeo, aprendemos a criar nosso primeiro código no Scratch, s algoritmos, sequências lógicas de passos para resolver problemas. Programar envolve entender e processar dados para gerar saídas úteis, como nas redes sociais.",
  initialRating = null,
  isWatched = false,
  isSaved = false,
  onRatingChange,
  onMarkAsWatched,
  onToggleSave,
  disabled = false,
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

  const handleRatingClick = (value: number) => {
    if (disabled) return;
    setRating(value);
    onRatingChange?.(value);
  };

  const handleMarkAsWatched = () => {
    if (disabled || watched) return; // Não permite desmarcar se já está assistida
    setWatched(true); // Sempre marca como true, nunca false
    onMarkAsWatched?.();
  };

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
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-4">
            {description}
          </p>
        </div>

        {/* Coluna direita: Card com Rating e Ações */}
        <div className="space-y-4">
          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={handleMarkAsWatched}
              disabled={disabled || watched}
              className={cn(
                "gap-2 transition-all flex-1 h-10",
                watched
                  ? "bg-success/10 border-success/30 text-success hover:bg-success/10 cursor-default"
                  : "cursor-pointer"
              )}
            >
              {watched ? (
                <Check className="h-4 w-4 text-success animate-in zoom-in-50" />
              ) : (
                <MonitorCheck className="h-4 w-4 text-success" />
              )}
              {watched ? "Aula assistida" : "Marcar como assistida"}
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
                    disabled={disabled}
                    onClick={() => handleRatingClick(value)}
                    onMouseEnter={() => !disabled && setHoverRating(value)}
                    onMouseLeave={() => !disabled && setHoverRating(0)}
                    className={cn(
                      "group transition-all disabled:cursor-not-allowed disabled:opacity-50",
                      !disabled && "hover:scale-110 cursor-pointer"
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
  );
}
