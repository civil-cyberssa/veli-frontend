'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Send, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeacherQuestionsProps {
  lessonId: number
  studentComment?: string | null
  teacherAnswer?: string | null
  onSubmitComment?: (comment: string) => Promise<void>
  isSubmitting?: boolean
}

export function TeacherQuestions({
  lessonId,
  studentComment,
  teacherAnswer,
  onSubmitComment,
  isSubmitting = false,
}: TeacherQuestionsProps) {
  const [comment, setComment] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmedComment = comment.trim()
  const hasStudentComment = Boolean(studentComment?.trim())
  const hasTeacherAnswer = Boolean(teacherAnswer?.trim())

  const canSubmit =
    Boolean(onSubmitComment) &&
    Boolean(trimmedComment) &&
    !isSubmitting &&
    lessonId > 0

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || !onSubmitComment) return

    try {
      await onSubmitComment(trimmedComment)
      setComment('')

      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('Erro ao enviar comentário ao professor:', error)
    }
  }

  // Handler para Enter (Shift+Enter para nova linha)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (canSubmit) {
        const form = event.currentTarget.form
        form?.requestSubmit()
      }
    }
  }

  return (
    <Card className="border overflow-hidden" data-tour="teacher-questions">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-medium text-foreground">
          Pergunte ao Professor
        </h3>
      </div>

      {/* Conteúdo FAQ */}
      <div className="p-4 space-y-4">
        {!lessonId ? (
          <div className="py-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Selecione uma aula
            </p>
          </div>
        ) : hasStudentComment ? (
          <div className="space-y-4">
            {/* Pergunta */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sua Pergunta
                </h4>
              </div>
              <div className="pl-3 border-l-2 border-muted">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                  {studentComment}
                </p>
              </div>
            </div>

            {/* Resposta ou Status */}
            {hasTeacherAnswer ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-green-600 rounded-full" />
                  <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                    Resposta do Professor
                  </h4>
                </div>
                <div className="pl-3 border-l-2 border-green-600/30">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {teacherAnswer}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Aguardando resposta do professor
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Nenhuma pergunta ainda
            </p>
            <p className="text-xs text-muted-foreground/70">
              Envie sua pergunta abaixo
            </p>
          </div>
        )}
      </div>

      {/* Input de pergunta */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              id={`teacher-comment-${lessonId}`}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasStudentComment ? "Atualize sua pergunta..." : "Digite sua pergunta..."}
              rows={3}
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none",
                "focus:outline-none focus:ring-1 focus:ring-primary",
                "placeholder:text-muted-foreground/50",
                "disabled:opacity-50"
              )}
              maxLength={500}
              disabled={!lessonId || !onSubmitComment || isSubmitting}
              autoFocus
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!canSubmit}
                size="sm"
                className={cn(
                  !canSubmit && "opacity-50"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {hasStudentComment ? 'Atualizar' : 'Enviar'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  )
}
