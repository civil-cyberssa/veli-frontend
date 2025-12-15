'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Send, Clock, CheckCircle2, Sparkles, User, GraduationCap, ArrowRight, Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeacherQuestionsProps {
  lessonId: number
  studentComment?: string | null
  teacherAnswer?: string | null
  onSubmitComment?: (comment: string) => Promise<void>
  isSubmitting?: boolean
}

// Estrutura de mensagem para o chat
interface ChatMessage {
  id: string
  type: 'student' | 'teacher'
  content: string
  timestamp: Date
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

// Função para formatar timestamp completo
function getFullTimestamp(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function TeacherQuestions({
  lessonId,
  studentComment,
  teacherAnswer,
  onSubmitComment,
  isSubmitting = false,
}: TeacherQuestionsProps) {
  const [comment, setComment] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [showScrollButton, setShowScrollButton] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Constrói histórico de mensagens a partir dos dados
  useEffect(() => {
    const chatHistory: ChatMessage[] = []

    if (studentComment?.trim()) {
      chatHistory.push({
        id: 'student-1',
        type: 'student',
        content: studentComment.trim(),
        timestamp: new Date() // Idealmente viria do backend
      })
    }

    if (teacherAnswer?.trim()) {
      chatHistory.push({
        id: 'teacher-1',
        type: 'teacher',
        content: teacherAnswer.trim(),
        timestamp: new Date() // Idealmente viria do backend
      })
    }

    setMessages(chatHistory)
  }, [studentComment, teacherAnswer, lessonId])

  // Auto-scroll para o final quando há nova mensagem
  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages])

  // Detecta se usuário scrollou para cima
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const trimmedComment = comment.trim()
  const hasMessages = messages.length > 0
  const hasStudentComment = messages.some(m => m.type === 'student')
  const hasTeacherAnswer = messages.some(m => m.type === 'teacher')

  const canSubmit =
    Boolean(onSubmitComment) &&
    Boolean(trimmedComment) &&
    !isSubmitting &&
    lessonId > 0

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || !onSubmitComment) return

    const messageContent = trimmedComment

    try {
      // Adiciona mensagem otimisticamente ao chat
      const newMessage: ChatMessage = {
        id: `student-${Date.now()}`,
        type: 'student',
        content: messageContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      setComment('')

      // Envia para o backend
      await onSubmitComment(messageContent)

      // Foca no textarea após envio
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    } catch (error) {
      console.error('Erro ao enviar comentário ao professor:', error)
      // Remove mensagem otimista em caso de erro
      setMessages(prev => prev.filter(m => m.content !== messageContent))
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

  // Componente de mensagem individual
  const ChatBubble = ({ message }: { message: ChatMessage }) => {
    const isStudent = message.type === 'student'
    const isPending = hasStudentComment && !hasTeacherAnswer && message.type === 'student'

    return (
      <div
        className={cn(
          "flex gap-3 items-start mb-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300",
          isStudent && "flex-row-reverse"
        )}
      >
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ring-2",
          isStudent
            ? "bg-gradient-to-br from-primary to-primary/80 ring-primary/20"
            : "bg-gradient-to-br from-blue-600 to-blue-500 ring-blue-500/20"
        )}>
          {isStudent ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <GraduationCap className="h-4 w-4 text-white" />
          )}
        </div>

        {/* Mensagem */}
        <div className={cn("flex-1 min-w-0 max-w-[85%]", isStudent && "flex flex-col items-end")}>
          <div className={cn(
            "rounded-2xl p-3.5 shadow-sm transition-all",
            isStudent
              ? "rounded-tr-sm bg-gradient-to-br from-primary/15 to-primary/10 border border-primary/25"
              : "rounded-tl-sm bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200/60 dark:border-blue-800/60"
          )}>
            <p className={cn(
              "text-sm leading-relaxed whitespace-pre-wrap break-words",
              isStudent
                ? "text-foreground"
                : "text-blue-950 dark:text-blue-50"
            )}>
              {message.content}
            </p>
          </div>

          {/* Timestamp e status */}
          <div className={cn(
            "flex items-center gap-1.5 mt-1 px-1",
            isStudent && "flex-row-reverse"
          )}>
            <span className="text-[10px] text-muted-foreground">
              {getRelativeTime(message.timestamp)}
            </span>
            {isPending && (
              <>
                <span className="text-[10px] text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600 dark:text-amber-500 animate-pulse" />
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                    Aguardando resposta
                  </span>
                </div>
              </>
            )}
            {!isPending && message.type === 'student' && hasTeacherAnswer && (
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-500" />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden flex flex-col h-[600px]" data-tour="teacher-questions">
      {/* Header compacto */}
      <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              Pergunte ao Professor
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Conversa privada com o professor
            </p>
          </div>
        </div>
      </div>

      {/* Container de mensagens scrollável */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-muted/5 to-background"
      >
        {!lessonId ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Selecione uma aula para conversar com o professor
              </p>
            </div>
          </div>
        ) : !hasMessages ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4 ring-4 ring-primary/5">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                Comece a conversa
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Faça sua primeira pergunta ou compartilhe dúvidas sobre esta aula.
                O professor responderá assim que possível.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Botão de scroll to bottom */}
      {showScrollButton && hasMessages && (
        <div className="absolute bottom-24 right-6 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => scrollToBottom('smooth')}
            className="p-2.5 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 ring-2 ring-primary/20"
            aria-label="Ir para o final"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input de mensagem fixo no bottom - estilo WhatsApp */}
      <div className="flex-shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="px-3 py-3">
          <div className="flex gap-2 items-end">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                id={`teacher-comment-${lessonId}`}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... (Enter para enviar)"
                rows={1}
                className={cn(
                  "w-full max-h-32 rounded-2xl border-2 bg-background px-4 py-2.5 text-sm resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200",
                  "placeholder:text-muted-foreground/60",
                  "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
                  isSubmitting && "opacity-70 cursor-wait"
                )}
                style={{
                  minHeight: '42px',
                  height: 'auto',
                  overflowY: comment.split('\n').length > 2 ? 'auto' : 'hidden'
                }}
                maxLength={500}
                disabled={!lessonId || !onSubmitComment || isSubmitting}
                autoFocus
              />

              {/* Contador de caracteres */}
              {comment.length > 400 && (
                <div className="absolute -top-6 right-0 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-sm border border-border/50">
                  <span className={cn(
                    "text-[10px] font-medium tabular-nums",
                    comment.length > 450 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
                    comment.length >= 490 && "text-red-600 dark:text-red-400"
                  )}>
                    {comment.length}/500
                  </span>
                </div>
              )}
            </div>

            {/* Botão de enviar */}
            <Button
              type="submit"
              disabled={!canSubmit}
              size="icon"
              className={cn(
                "h-[42px] w-[42px] rounded-full shadow-md transition-all duration-200 flex-shrink-0",
                canSubmit
                  ? "bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-105 active:scale-95"
                  : "bg-muted",
                isSubmitting && "animate-pulse"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className={cn(
                  "h-5 w-5 transition-transform",
                  canSubmit && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                )} />
              )}
            </Button>
          </div>

          {/* Info text */}
          <div className="mt-2 px-1 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              <span className="hidden sm:inline">Apenas você e o professor verão esta conversa</span>
              <span className="sm:hidden">Conversa privada</span>
            </p>
            {!hasMessages && (
              <p className="text-[10px] text-muted-foreground">
                Shift+Enter para nova linha
              </p>
            )}
          </div>
        </form>
      </div>
    </Card>
  )
}
