'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Send, Clock, CheckCircle2, Sparkles, User, GraduationCap, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeacherQuestionsProps {
  lessonId: number
  studentComment?: string | null
  teacherAnswer?: string | null
  onSubmitComment?: (comment: string) => Promise<void>
  isSubmitting?: boolean
}

// Função helper para formatar tempo relativo
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'agora há pouco'
  if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`
  if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)}d`

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function TeacherQuestions({
  lessonId,
  studentComment,
  teacherAnswer,
  onSubmitComment,
  isSubmitting = false,
}: TeacherQuestionsProps) {
  const [comment, setComment] = useState(studentComment ?? '')
  const [lastSubmittedAt, setLastSubmittedAt] = useState<Date | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setComment(studentComment ?? '')
  }, [studentComment, lessonId])

  // Auto-scroll para o final quando há nova resposta
  useEffect(() => {
    if (hasTeacherAnswer && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [teacherAnswer])

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
      setLastSubmittedAt(new Date())
      // Limpa o campo apenas se for uma nova mensagem (não atualização)
      if (!hasStudentComment) {
        setComment('')
      }
      // Foca no textarea após envio
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
              {/* Estado vazio - Nenhum comentário ainda */}
              {!hasStudentComment ? (
                <div className="rounded-2xl border-2 border-dashed border-muted/40 bg-gradient-to-br from-muted/20 to-muted/5 p-8 text-center transition-all hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4 ring-4 ring-primary/5">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-2">
                    Inicie uma conversa
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Faça perguntas, compartilhe dúvidas ou deixe comentários sobre esta aula.
                    Seu professor responderá em breve.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Fluxo de conversa - Sua pergunta */}
                  <div className="flex gap-3 items-start animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md ring-2 ring-primary/20">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-foreground">
                          Você
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          • perguntou
                        </span>
                        {lastSubmittedAt && (
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {getRelativeTime(lastSubmittedAt)}
                          </span>
                        )}
                      </div>
                      <div className="group rounded-2xl rounded-tl-sm bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                        <p className="text-sm text-foreground whitespace-pre-line break-words leading-relaxed">
                          {studentComment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resposta do professor ou status de aguardando */}
                  {hasTeacherAnswer ? (
                    <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-3 duration-500">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md ring-2 ring-blue-500/20">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            Professor
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            • respondeu
                          </span>
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500 ml-auto" />
                        </div>
                        <div className="group rounded-2xl rounded-tl-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300/60 dark:hover:border-blue-700/60">
                          <p className="text-sm text-blue-950 dark:text-blue-50 whitespace-pre-line break-words leading-relaxed">
                            {teacherAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-4 px-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/50 transition-all animate-in fade-in-50 duration-300">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                        <Clock className="h-4 w-4 text-white animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-0.5">
                          Aguardando resposta
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                          O professor foi notificado e responderá em breve
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse flex-shrink-0" />
                    </div>
                  )}

                  {/* Ref para scroll automático */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Formulário de envio */}
        <div className="px-5 py-5 bg-gradient-to-b from-muted/5 to-muted/10">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor={`teacher-comment-${lessonId}`}
                  className="text-sm font-semibold text-foreground flex items-center gap-2"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Send className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {hasStudentComment ? 'Atualizar mensagem' : 'Nova mensagem'}
                </label>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-xs font-semibold transition-colors tabular-nums",
                    comment.length > 450 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
                    comment.length >= 500 && "text-red-600 dark:text-red-400"
                  )}>
                    {comment.length}
                  </span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="text-xs text-muted-foreground">500</span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  id={`teacher-comment-${lessonId}`}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    hasStudentComment
                      ? 'Atualize seu comentário ou faça uma nova pergunta...'
                      : 'Digite sua pergunta ou comentário aqui... (Enter para enviar, Shift+Enter para nova linha)'
                  }
                  className={cn(
                    "w-full min-h-32 rounded-xl border-2 bg-background px-4 py-3.5 text-sm resize-y",
                    "focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200",
                    "placeholder:text-muted-foreground/60",
                    "shadow-sm hover:shadow-md hover:border-primary/40",
                    isSubmitting && "opacity-70 cursor-wait"
                  )}
                  maxLength={500}
                  disabled={!lessonId || !onSubmitComment || isSubmitting}
                  autoFocus={!hasStudentComment}
                />
                {comment.length > 450 && (
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 animate-in fade-in-50 duration-200">
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                      {500 - comment.length} caracteres restantes
                    </span>
                  </div>
                )}
                {isSubmitting && (
                  <div className="absolute inset-0 rounded-xl bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 shadow-lg">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      <span className="text-sm font-medium text-primary">Enviando...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Apenas você e o professor verão esta mensagem</span>
                  <span className="sm:hidden">Mensagem privada</span>
                </div>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "shadow-md hover:shadow-lg transition-all duration-200",
                    "disabled:shadow-none disabled:opacity-50",
                    "group relative overflow-hidden",
                    canSubmit && "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                  size="default"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className={cn(
                        "h-4 w-4 mr-2 transition-transform",
                        canSubmit && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      )} />
                      {hasStudentComment ? 'Atualizar' : 'Enviar'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {!hasStudentComment && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
              <div className="flex gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <MessageCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Dica para uma boa pergunta
                  </p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300/80 leading-relaxed">
                    Seja específico sobre suas dúvidas. Mencione o minuto do vídeo ou
                    o conceito que não entendeu. Quanto mais detalhes, melhor o professor
                    poderá ajudá-lo!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
