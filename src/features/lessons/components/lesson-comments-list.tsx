"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Edit2, X } from "lucide-react";
import { CommentInput } from "./comment-input";
import type { LessonCommentsResponse } from "@/src/features/dashboard/hooks/useLessonComments";

interface LessonCommentsListProps {
  commentsData: LessonCommentsResponse | null;
  isLoading?: boolean;
  onSubmitComment: (comment: string) => Promise<void>;
  onEditComment?: (commentId: number, newComment: string) => Promise<void>;
  isSubmitting?: boolean;
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
  const diffInWeeks = Math.floor(diffInMs / 604800000);

  if (diffInMinutes < 1) return "agora";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  if (diffInWeeks < 4) return `${diffInWeeks}sem`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function LessonCommentsList({
  commentsData,
  isLoading,
  onSubmitComment,
  onEditComment,
  isSubmitting = false,
}: LessonCommentsListProps) {
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const { myComment, otherComments } = useMemo(() => {
    if (!commentsData?.results) {
      return { myComment: null, otherComments: [] };
    }

    const my = commentsData.results.find((c) => c.current_user);
    const others = commentsData.results.filter((c) => !c.current_user);

    return { myComment: my || null, otherComments: others };
  }, [commentsData]);

  const totalComments = (myComment ? 1 : 0) + otherComments.length;

  const handleEditClick = (commentId: number, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleSaveEdit = async () => {
    if (!editingText.trim() || !editingCommentId || !onEditComment) return;

    await onEditComment(editingCommentId, editingText.trim());
    setEditingCommentId(null);
    setEditingText("");
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <div className="p-6">
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Carregando comentários...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <div className="divide-y divide-border/50">
        {/* Header */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Comentários
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalComments} {totalComments === 1 ? "comentário" : "comentários"}
          </p>
        </div>

        {/* Lista de comentários */}
        {totalComments > 0 && (
          <div className="max-h-[400px] overflow-y-auto">
            {/* Meu comentário destacado no topo */}
            {myComment && (
              <div className="bg-primary/5 border-l-2 border-primary">
                <div className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                      <AvatarImage src={myComment.profile_pic_url} alt={myComment.user_name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(myComment.user_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">
                            {myComment.user_name}
                          </p>
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-medium">
                            Você
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(myComment.created_at)}
                          </span>
                        </div>
                        {editingCommentId !== myComment.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(myComment.id, myComment.comment)}
                            className="h-7 px-2"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {editingCommentId === myComment.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            maxLength={500}
                          />
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Salvar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              <X className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-foreground mt-1 leading-relaxed break-words">
                          {myComment.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Comentários de outros usuários */}
            {otherComments.map((comment) => (
              <div
                key={comment.id}
                className="px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={comment.profile_pic_url} alt={comment.user_name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(comment.user_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {comment.user_name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-foreground mt-1 leading-relaxed break-words">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalComments === 0 && (
          <div className="p-6">
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="rounded-full bg-muted/50 p-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Nenhum comentário ainda
                </p>
                <p className="text-xs text-muted-foreground">
                  Seja o primeiro a comentar sobre esta aula
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Campo para novo comentário */}
        <div className="px-4 py-4 bg-muted/20">
          <CommentInput
            onSubmit={onSubmitComment}
            isSubmitting={isSubmitting}
            placeholder="Escreva um comentário sobre esta aula..."
          />
        </div>
      </div>
    </Card>
  );
}
