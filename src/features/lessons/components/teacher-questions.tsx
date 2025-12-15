'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Send, Clock, Loader2, Trash2, Edit2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useLessonDoubts,
  useCreateDoubt,
  useUpdateDoubt,
  useDeleteDoubt,
  type LessonDoubt
} from '@/src/features/lessons/hooks/useLessonDoubts'
import { toast } from 'sonner'

interface TeacherQuestionsProps {
  lessonId: number
  registrationId?: number
}

// Função para formatar data
function formatDate(dateString: string): string {
  const date = new Date(dateString)
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
  registrationId,
}: TeacherQuestionsProps) {
  const [newQuestion, setNewQuestion] = useState('')
  const [editingDoubtId, setEditingDoubtId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: doubts = [], isLoading } = useLessonDoubts(registrationId, lessonId)
  const createDoubt = useCreateDoubt()
  const updateDoubt = useUpdateDoubt()
  const deleteDoubt = useDeleteDoubt()

  // Debug logs
  console.log('TeacherQuestions - lessonId:', lessonId)
  console.log('TeacherQuestions - registrationId:', registrationId)
  console.log('TeacherQuestions - doubts:', doubts)
  console.log('TeacherQuestions - isLoading:', isLoading)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!registrationId || !newQuestion.trim()) return

    try {
      await createDoubt.mutateAsync({
        registration: registrationId,
        lesson: lessonId,
        comment: newQuestion.trim(),
      })
      setNewQuestion('')
      toast.success('Pergunta enviada!')
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch (error) {
      toast.error('Erro ao enviar pergunta')
      console.error('Erro ao criar dúvida:', error)
    }
  }

  const handleUpdate = async (doubtId: number) => {
    if (!registrationId || !editContent.trim()) return

    try {
      await updateDoubt.mutateAsync({
        registrationId,
        doubtId,
        payload: { comment: editContent.trim() },
      })
      setEditingDoubtId(null)
      setEditContent('')
      toast.success('Pergunta atualizada!')
    } catch (error) {
      toast.error('Erro ao atualizar pergunta')
      console.error('Erro ao atualizar dúvida:', error)
    }
  }

  const handleDelete = async (doubtId: number) => {
    if (!registrationId) return
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return

    try {
      await deleteDoubt.mutateAsync({ registrationId, doubtId })
      toast.success('Pergunta excluída!')
    } catch (error) {
      toast.error('Erro ao excluir pergunta')
      console.error('Erro ao deletar dúvida:', error)
    }
  }

  const startEditing = (doubt: LessonDoubt) => {
    setEditingDoubtId(doubt.id)
    setEditContent(doubt.comment)
  }

  const cancelEditing = () => {
    setEditingDoubtId(null)
    setEditContent('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (newQuestion.trim()) {
        const form = event.currentTarget.form
        form?.requestSubmit()
      }
    }
  }

  return (
    <Card className="border overflow-hidden" data-tour="teacher-questions">
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            Pergunte ao Professor
          </h3>
          {doubts.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {doubts.length} {doubts.length === 1 ? 'pergunta' : 'perguntas'}
            </span>
          )}
        </div>
      </div>

      {/* Lista de Dúvidas */}
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : !lessonId ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Selecione uma aula
            </p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Nenhuma pergunta ainda
            </p>
            <p className="text-xs text-muted-foreground/70">
              Envie sua primeira pergunta abaixo
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {doubts.map((doubt) => (
              <div key={doubt.id} className="p-4 space-y-3">
                {/* Pergunta */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Sua Pergunta
                      </h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(doubt.created_at)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => startEditing(doubt)}
                        disabled={editingDoubtId !== null}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDelete(doubt.id)}
                        disabled={deleteDoubt.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {editingDoubtId === doubt.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(doubt.id)}
                          disabled={!editContent.trim() || updateDoubt.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-3 border-l-2 border-muted">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {doubt.comment}
                      </p>
                    </div>
                  )}
                </div>

                {/* Respostas do Professor */}
                {doubt.doubt_answers.length > 0 ? (
                  <div className="space-y-3">
                    {doubt.doubt_answers.map((answer) => (
                      <div key={answer.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-4 bg-green-600 rounded-full" />
                          <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                            {answer.teacher_name}
                          </h4>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {formatDate(answer.created_at)}
                          </span>
                        </div>
                        <div className="pl-3 border-l-2 border-green-600/30">
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                            {answer.comment}
                          </p>
                        </div>
                      </div>
                    ))}
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
            ))}
          </div>
        )}
      </div>

      {/* Input de nova pergunta */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              id={`teacher-question-${lessonId}`}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua pergunta..."
              rows={3}
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none",
                "focus:outline-none focus:ring-1 focus:ring-primary",
                "placeholder:text-muted-foreground/50",
                "disabled:opacity-50"
              )}
              maxLength={500}
              disabled={!lessonId || !registrationId || createDoubt.isPending}
              autoFocus
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newQuestion.trim() || !registrationId || createDoubt.isPending}
                size="sm"
                className={cn(
                  (!newQuestion.trim() || !registrationId) && "opacity-50"
                )}
              >
                {createDoubt.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
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

