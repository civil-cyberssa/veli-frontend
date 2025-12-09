"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface CommentInputProps {
  onSubmit: (comment: string) => Promise<void>;
  isSubmitting?: boolean;
  initialValue?: string;
  placeholder?: string;
}

export function CommentInput({
  onSubmit,
  isSubmitting = false,
  initialValue = "",
  placeholder = "Compartilhe seu feedback ou dúvidas sobre a aula",
}: CommentInputProps) {
  const [comment, setComment] = useState(initialValue);
  const isEmpty = !comment.trim();

  const handleSubmit = async () => {
    if (isEmpty || isSubmitting) return;

    await onSubmit(comment.trim());
    setComment("");
  };

  return (
    <div className="space-y-3">
      <textarea
        className="w-full min-h-24 rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        placeholder={placeholder}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isSubmitting}
        maxLength={500}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {comment.length}/500
        </span>
        <Button
          onClick={handleSubmit}
          disabled={isEmpty || isSubmitting}
          size="sm"
        >
          <MessageCircle className="h-3.5 w-3.5 mr-2" />
          {isSubmitting ? "Enviando..." : "Enviar comentário"}
        </Button>
      </div>
    </div>
  );
}
