'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Send } from 'lucide-react'

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
  const [comment, setComment] = useState(studentComment ?? '')

  useEffect(() => {
    setComment(studentComment ?? '')
  }, [studentComment, lessonId])

  const trimmedComment = comment.trim()
  const savedComment = studentComment?.trim() ?? ''
  const hasStudentComment = Boolean(savedComment)
  const hasTeacherAnswer = Boolean(teacherAnswer?.trim())

  const canSubmit =
    Boolean(onSubmitComment) &&
    Boolean(trimmedComment) &&
    trimmedComment !== savedComment &&
    !isSubmitting &&
    lessonId > 0

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || !onSubmitComment) return
    try {
      await onSubmitComment(trimmedComment)
    } catch (error) {
      console.error('Erro ao enviar comentário ao professor:', error)
    }
  }

  return (
    <Card className="border-border/50" data-tour="teacher-questions">
      <div className="divide-y divide-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <span className="p-2 rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Pergunte ao Professor
            </h3>
            <p className="text-xs text-muted-foreground">
              Seu comentário é privado — somente você e o professor podem ver.
            </p>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {!lessonId ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Selecione uma aula para enviar um comentário ao professor.
            </div>
          ) : (
            <>
              {hasStudentComment ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-[11px] font-semibold uppercase text-primary mb-1 tracking-wide">
                    Seu comentário
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-line break-words">
                    {studentComment}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-muted/40 p-4 text-center text-sm text-muted-foreground">
                  Você ainda não enviou um comentário ao professor nesta aula.
                </div>
              )}

              {hasTeacherAnswer && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                  <p className="text-[11px] font-semibold uppercase text-blue-600 dark:text-blue-300 mb-1 tracking-wide">
                    Resposta do professor
                  </p>
                  <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line break-words">
                    {teacherAnswer}
                  </p>
                </div>
              )}

              {!hasTeacherAnswer && hasStudentComment && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  <span>Aguardando resposta do professor</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-4 py-4 bg-muted/20">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor={`teacher-comment-${lessonId}`}
                className="text-xs font-medium text-muted-foreground block mb-2"
              >
                Compartilhe um comentário com seu professor
              </label>
              <textarea
                id={`teacher-comment-${lessonId}`}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={
                  hasStudentComment
                    ? 'Atualize seu comentário...'
                    : 'Escreva algo que gostaria de compartilhar com o professor...'
                }
                className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                maxLength={500}
                disabled={!lessonId || !onSubmitComment}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {comment.length}/500
                </span>
                <Button type="submit" disabled={!canSubmit}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting
                    ? 'Enviando...'
                    : hasStudentComment
                      ? 'Atualizar comentário'
                      : 'Enviar comentário'}
                </Button>
              </div>
            </div>
          </form>
          <p className="mt-2 text-[11px] text-muted-foreground">
            O professor responderá por esta mesma área quando visualizar seu comentário.
          </p>
        </div>
      </div>
    </Card>
  )
}
