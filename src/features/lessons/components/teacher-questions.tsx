'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Send, Clock, CheckCircle2, Sparkles } from 'lucide-react'
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
    <Card className="border-border/50 overflow-hidden" data-tour="teacher-questions">
      <div className="divide-y divide-border/50">
        {/* Header com gradiente sutil */}
        <div className="px-5 py-4 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-1">
                Pergunte ao Professor
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seus comentários são privados — apenas você e o professor podem visualizar.
              </p>
            </div>
          </div>
        </div>

        {/* Área de conteúdo */}
        <div className="px-5 py-5 space-y-4 bg-background">
          {!lessonId ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Selecione uma aula para enviar um comentário ao professor.
              </p>
            </div>
          ) : (
            <>
              {/* Comentário do aluno */}
              {hasStudentComment ? (
                <div className="group relative rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <p className="text-[11px] font-semibold uppercase text-primary tracking-wide">
                      Seu comentário
                    </p>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-line break-words leading-relaxed">
                    {studentComment}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-muted/50 bg-muted/20 p-6 text-center transition-colors hover:border-muted/70 hover:bg-muted/30">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-background mb-3">
                    <Sparkles className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    Ainda sem comentários
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Envie sua primeira pergunta ou comentário ao professor
                  </p>
                </div>
              )}

              {/* Resposta do professor com animação */}
              {hasTeacherAnswer && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="relative rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 shadow-sm">
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-[11px] font-semibold uppercase text-blue-600 dark:text-blue-400 tracking-wide">
                        Resposta do professor
                      </p>
                    </div>
                    <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line break-words leading-relaxed">
                      {teacherAnswer}
                    </p>
                  </div>
                </div>
              )}

              {/* Status de aguardando resposta */}
              {!hasTeacherAnswer && hasStudentComment && (
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500 animate-pulse" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    Aguardando resposta do professor
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Formulário de envio */}
        <div className="px-5 py-5 bg-muted/10">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor={`teacher-comment-${lessonId}`}
                className="text-xs font-semibold text-foreground/80 block mb-2.5 flex items-center gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                {hasStudentComment ? 'Atualizar seu comentário' : 'Escreva seu comentário'}
              </label>
              <div className="relative">
                <textarea
                  id={`teacher-comment-${lessonId}`}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={
                    hasStudentComment
                      ? 'Atualize seu comentário ou faça uma nova pergunta...'
                      : 'Ex: Tenho dúvidas sobre o tópico X, poderia explicar melhor?'
                  }
                  className={cn(
                    "w-full min-h-28 rounded-lg border bg-background px-4 py-3 text-sm resize-y",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200",
                    "placeholder:text-muted-foreground/50"
                  )}
                  maxLength={500}
                  disabled={!lessonId || !onSubmitComment}
                />
              </div>
              <div className="flex items-center justify-between mt-2.5 gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    comment.length > 450 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground",
                    comment.length >= 500 && "text-red-600 dark:text-red-500"
                  )}>
                    {comment.length}/500
                  </span>
                  {comment.length > 450 && (
                    <span className="text-[10px] text-muted-foreground">
                      ({500 - comment.length} restantes)
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="shadow-sm hover:shadow transition-all"
                  size="sm"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
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
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
              <MessageCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-muted-foreground/50" />
              <span>
                O professor será notificado e responderá através desta mesma área.
                Você receberá uma notificação quando houver resposta.
              </span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
