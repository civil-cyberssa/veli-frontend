"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Star, Check, Bookmark, MonitorCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LessonDescriptionCardProps {
  title?: string;
  description?: string;
  initialRating?: number | null;
  initialComment?: string;
  courseName?: string;
  isWatched?: boolean;
  isSaved?: boolean;
  onRatingChange?: (rating: number) => void;
  onSubmitComment?: (comment: string) => Promise<void> | void;
  onMarkAsWatched?: () => void;
  onToggleSave?: () => void;
  disabled?: boolean;
  ratingDisabled?: boolean;
  isCommentSubmitting?: boolean;
}

export function LessonDescriptionCard({
  title = "Meu primeiro algoritmo",
  description = "Neste vídeo, aprendemos a criar nosso primeiro código no Scratch, s algoritmos, sequências lógicas de passos para resolver problemas. Programar envolve entender e processar dados para gerar saídas úteis, como nas redes sociais.",
  initialRating = null,
  initialComment = "",
  courseName,
  isWatched = false,
  isSaved = false,
  onRatingChange,
  onSubmitComment,
  onMarkAsWatched,
  onToggleSave,
  disabled = false,
  ratingDisabled = false,
  isCommentSubmitting = false,
}: LessonDescriptionCardProps) {
  const { data: session } = useSession();
  const displayName = useMemo(
    () => session?.user?.name || session?.student_full_name || "Aluno",
    [session]
  );
  const displayImage = session?.profile_pic_url || session?.user?.image || "";
  const displayCourse =
    courseName || session?.languages?.[0]?.name || "Seu curso atual";

  const [rating, setRating] = useState<number>(initialRating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [commentInput, setCommentInput] = useState(initialComment);
  const [savedComment, setSavedComment] = useState(initialComment);
  const [isEditingComment, setIsEditingComment] = useState(!initialComment);
  const [watched, setWatched] = useState(isWatched);
  const [saved, setSaved] = useState(isSaved);

  const isCommentEmpty = !commentInput.trim();
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  // Sincronizar estado local com prop, mas só permitir mudança de false para true
  useEffect(() => {
    if (isWatched && !watched) {
      setWatched(true);
    }
  }, [isWatched, watched]);

  useEffect(() => {
    setRating(initialRating || 0);
  }, [initialRating]);

  useEffect(() => {
    setCommentInput(initialComment || "");
    setSavedComment(initialComment || "");
    setIsEditingComment(!initialComment);
  }, [initialComment]);

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

  const handleToggleSave = () => {
    if (disabled) return;
    setSaved(!saved);
    onToggleSave?.();
  };

  const handleSubmitComment = async () => {
    if (disabled || isCommentSubmitting || !onSubmitComment || isCommentEmpty) return;

    const trimmedComment = commentInput.trim();

    await onSubmitComment(trimmedComment);
    setSavedComment(trimmedComment);
    setCommentInput("");
    setIsEditingComment(false);
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

          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Seu comentário enviado</h3>
              <div className="rounded-lg border border-border/60 bg-card/70 p-3 shadow-sm">
                {savedComment ? (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={displayImage} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{displayName}</p>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {displayCourse}
                        </span>
                        <span className="text-xs text-muted-foreground">comentou nesta aula</span>
                      </div>

                      <div className="max-w-full rounded-2xl border border-primary/10 bg-primary/5 px-3 py-2">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                          {savedComment}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={displayImage} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm">Nenhum comentário enviado ainda.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-foreground" htmlFor="lesson-comment">
                  Deixe um comentário sobre esta aula
                </label>
                {savedComment && !isEditingComment && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingComment(true);
                      setCommentInput(savedComment);
                    }}
                    disabled={disabled}
                  >
                    Editar comentário
                  </Button>
                )}
              </div>

              {(!savedComment || isEditingComment) && (
                <>
                  <textarea
                    id="lesson-comment"
                    className="w-full min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Compartilhe seu feedback ou dúvidas sobre a aula"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    disabled={disabled || isCommentSubmitting}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {isCommentEmpty
                        ? "Digite algo para enviar seu comentário."
                        : savedComment
                        ? "Atualize seu comentário enviado."
                        : "Pronto para enviar seu feedback."}
                    </span>
                    <span>{commentInput.length}/500</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {savedComment && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingComment(false);
                          setCommentInput("");
                        }}
                        disabled={disabled || isCommentSubmitting}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={disabled || isCommentSubmitting || isCommentEmpty}
                      className="min-w-[180px]"
                    >
                      {isCommentSubmitting
                        ? "Enviando..."
                        : savedComment
                        ? "Salvar comentário"
                        : "Enviar comentário"}
                    </Button>
                  </div>
                </>
              )}

              {savedComment && !isEditingComment && (
                <p className="text-xs text-muted-foreground">Você já enviou um comentário. Clique em “Editar comentário” para atualizar.</p>
              )}
            </div>
          </div>
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
              data-tour="mark-watched"
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
  );
}

function getInitials(name: string) {
  if (!name) return "?";

  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";

  const [first, second] = parts;
  const initials = `${first?.[0] || ""}${second?.[0] || ""}`;

  return initials.toUpperCase() || "?";
}
