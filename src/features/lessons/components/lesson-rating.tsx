'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface LessonRatingProps {
  initialRating?: number | null
  onRatingChange?: (rating: number) => void
  disabled?: boolean
}

export function LessonRating({ initialRating = null, onRatingChange, disabled = false }: LessonRatingProps) {
  const [rating, setRating] = useState<number>(initialRating || 0)
  const [hoverRating, setHoverRating] = useState<number>(0)

  const handleRatingClick = (value: number) => {
    if (disabled) return
    setRating(value)
    onRatingChange?.(value)
  }

  return (
    <Card className="p-4 border-border/50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Avalie esta aula</h3>
          {rating > 0 && (
            <span className="text-xs text-muted-foreground">
              {rating} de 5 estrelas
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => !disabled && setHoverRating(value)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              className="group transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Avaliar com ${value} estrela${value > 1 ? 's' : ''}`}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  value <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-xs text-muted-foreground">
            {rating === 1 && 'Precisa melhorar'}
            {rating === 2 && 'Poderia ser melhor'}
            {rating === 3 && 'Boa aula'}
            {rating === 4 && 'Muito boa!'}
            {rating === 5 && 'Excelente!'}
          </p>
        )}
      </div>
    </Card>
  )
}
