"use client"

import { useState } from "react"
import { BookOpenCheck, FileText, Loader2, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { LessonProgress } from "@/src/features/dashboard/hooks/useEventProgress"

interface MobileLessonOverviewProps {
  title?: string
  description?: string
  eventId?: number
  exercise?: LessonProgress["exercise"]
  supportMaterialUrl?: string
  initialRating?: number | null
  ratingDisabled?: boolean
  onOpenQuiz?: (eventId: number, exerciseName: string) => void
  onRatingChange?: (rating: number) => void | Promise<void>
}

const actionClassName =
  "h-14 min-w-0 flex-col gap-1 rounded-lg bg-transparent px-2 text-xs font-medium text-muted-foreground shadow-none whitespace-normal hover:bg-muted/30 hover:text-foreground active:scale-95"

export function MobileLessonOverview({
  title,
  description,
  eventId,
  exercise,
  supportMaterialUrl,
  initialRating,
  ratingDisabled = false,
  onOpenQuiz,
  onRatingChange,
}: MobileLessonOverviewProps) {
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState(initialRating ?? 0)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const hasExercise = Boolean(exercise && exercise.questions_count > 0 && eventId)

  const handleRating = async (rating: number) => {
    if (ratingDisabled || isSubmittingRating) return

    setSelectedRating(rating)
    setIsSubmittingRating(true)

    try {
      await onRatingChange?.(rating)
      setIsRatingOpen(false)
    } finally {
      setIsSubmittingRating(false)
    }
  }

  return (
    <section className="space-y-4 lg:hidden" aria-labelledby="mobile-lesson-title">
      <h1 id="mobile-lesson-title" className="text-xl font-bold leading-tight tracking-tight">
        {title || "Aula atual"}
      </h1>

      <div className="grid grid-cols-3 gap-1" aria-label="Ações da aula">
        <Button
          type="button"
          variant="ghost"
          className={actionClassName}
          disabled={!hasExercise}
          onClick={() => {
            if (exercise && eventId) onOpenQuiz?.(eventId, exercise.name)
          }}
        >
          <BookOpenCheck className="size-5" />
          Exercício
        </Button>

        {supportMaterialUrl ? (
          <Button asChild variant="ghost" className={actionClassName}>
            <a href={supportMaterialUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="size-5" />
              Material
            </a>
          </Button>
        ) : (
          <Button type="button" variant="ghost" className={actionClassName} disabled>
            <FileText className="size-5" />
            Material
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          className={actionClassName}
          onClick={() => setIsRatingOpen(true)}
        >
          <Star className={cn("size-5", selectedRating > 0 && "fill-yellow-400 text-yellow-400")} />
          {selectedRating > 0 ? `Nota ${selectedRating}` : "Avaliar"}
        </Button>
      </div>

      {description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}

      <Dialog open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle>Avalie esta aula</DialogTitle>
            <DialogDescription>
              Sua opinião ajuda a melhorar a experiência das próximas aulas.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={ratingDisabled || isSubmittingRating}
                onClick={() => handleRating(rating)}
                className="flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Avaliar com ${rating} estrela${rating > 1 ? "s" : ""}`}
              >
                {isSubmittingRating && rating === selectedRating ? (
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                ) : (
                  <Star
                    className={cn(
                      "h-8 w-8",
                      rating <= selectedRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/35"
                    )}
                  />
                )}
              </button>
            ))}
          </div>

          {ratingDisabled && selectedRating > 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Você avaliou esta aula com {selectedRating} estrelas.
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
