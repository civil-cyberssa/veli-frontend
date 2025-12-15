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
          "flex gap-2 items-end mb-3",
          isStudent ? "justify-end" : "justify-start"
        )}
      >
        {/* Mensagem */}
        <div className={cn(
          "max-w-[80%] flex flex-col",
          isStudent ? "items-end" : "items-start"
        )}>
          {/* Nome do remetente (apenas para professor) */}
          {!isStudent && (
            <span className="text-[10px] text-muted-foreground px-3 mb-1">
              Professor
            </span>
          )}

          <div className={cn(
            "rounded-2xl px-4 py-2.5",
            isStudent
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {/* Timestamp e status */}
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-[10px] text-muted-foreground/70">
              {getRelativeTime(message.timestamp)}
            </span>
            {isPending && (
              <>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <Clock className="h-3 w-3 text-muted-foreground/70" />
              </>
            )}
            {!isPending && message.type === 'student' && hasTeacherAnswer && (
              <>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <CheckCircle2 className="h-3 w-3 text-muted-foreground/70" />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border overflow-hidden flex flex-col h-[600px]" data-tour="teacher-questions">
      {/* Header simples */}
      <div className="flex-shrink-0 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            Pergunte ao Professor
          </h3>
          <span className="text-xs text-muted-foreground">
            {hasMessages ? `${messages.length} ${messages.length === 1 ? 'mensagem' : 'mensagens'}` : 'Privado'}
          </span>
        </div>
      </div>

      {/* Container de mensagens scrollável */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 bg-background"
      >
        {!lessonId ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Selecione uma aula
              </p>
            </div>
          </div>
        ) : !hasMessages ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm px-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Nenhuma mensagem ainda
              </p>
              <p className="text-xs text-muted-foreground/70">
                Envie sua primeira pergunta ao professor
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Botão de scroll to bottom */}
      {showScrollButton && hasMessages && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-20 right-4 z-10 p-2 rounded-full bg-background border shadow-sm hover:shadow transition-all"
          aria-label="Ir para o final"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {/* Input de mensagem */}
      <div className="flex-shrink-0 border-t p-3">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              id={`teacher-comment-${lessonId}`}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mensagem..."
              rows={1}
              className={cn(
                "flex-1 max-h-24 rounded-lg border bg-background px-3 py-2 text-sm resize-none",
                "focus:outline-none focus:ring-1 focus:ring-primary",
                "placeholder:text-muted-foreground/50",
                "disabled:opacity-50"
              )}
              style={{
                minHeight: '40px',
                height: 'auto',
                overflowY: comment.split('\n').length > 2 ? 'auto' : 'hidden'
              }}
              maxLength={500}
              disabled={!lessonId || !onSubmitComment || isSubmitting}
              autoFocus
            />

            <Button
              type="submit"
              disabled={!canSubmit}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-lg flex-shrink-0",
                !canSubmit && "opacity-50"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {comment.length > 450 && (
            <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
              {comment.length}/500
            </p>
          )}
        </form>
      </div>
    </Card>
  )
}
