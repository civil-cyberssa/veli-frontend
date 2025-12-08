"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import type { LessonCommentsResponse } from "@/src/features/dashboard/hooks/useLessonComments";

interface LessonCommentsListProps {
  commentsData: LessonCommentsResponse | null;
  isLoading?: boolean;
}

function getInitials(name: string) {
  if (!name) return "?";

  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";

  const [first, second] = parts;
  const initials = `${first?.[0] || ""}${second?.[0] || ""}`;

  return initials.toUpperCase() || "?";
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) return "agora mesmo";
  if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
  if (diffInHours < 24) return `há ${diffInHours}h`;
  if (diffInDays === 1) return "ontem";
  if (diffInDays < 7) return `há ${diffInDays} dias`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function LessonCommentsList({
  commentsData,
  isLoading,
}: LessonCommentsListProps) {
  const comments = useMemo(
    () => commentsData?.results || [],
    [commentsData]
  );

  const otherComments = useMemo(
    () => comments.filter((comment) => !comment.current_user),
    [comments]
  );

  if (isLoading) {
    return (
      <Card className="p-6 border-border/50">
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Carregando comentários...</p>
        </div>
      </Card>
    );
  }

  if (otherComments.length === 0) {
    return (
      <Card className="p-6 border-border/50">
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground text-center">
            Nenhum comentário de outros alunos ainda.
            <br />
            Seja o primeiro a comentar!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Comentários da turma
          </h3>
          <span className="text-xs text-muted-foreground">
            {otherComments.length} {otherComments.length === 1 ? "comentário" : "comentários"}
          </span>
        </div>

        <div className="space-y-4">
          {otherComments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.profile_pic_url} alt={comment.user_name} />
                <AvatarFallback>{getInitials(comment.user_name)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {comment.user_name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>

                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {comment.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
