'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeacherQuestionsProps {
  lessonId: number
}

interface Question {
  id: number
  user_name: string
  user_id: number
  profile_pic_url: string
  question: string
  created_at: string
  current_user: boolean
  answer?: {
    teacher_name: string
    teacher_profile_pic_url: string
    answer: string
    answered_at: string
  }
}

// Dados mockados - apenas perguntas do próprio usuário (current_user: true)
// Em produção, a API filtrará para retornar apenas perguntas do usuário logado
const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    user_name: 'Você',
    user_id: 2,
    profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    question: 'Professor, poderia explicar melhor a diferença entre const e let em JavaScript?',
    created_at: '2025-12-09T14:30:00-03:00',
    current_user: true,
    answer: {
      teacher_name: 'Prof. João Santos',
      teacher_profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
      answer: 'Ótima pergunta! A diferença principal é que "const" cria uma constante (valor não pode ser reatribuído), enquanto "let" permite reatribuição. Use "const" sempre que possível para evitar mudanças acidentais no código.',
      answered_at: '2025-12-09T15:45:00-03:00',
    },
  },
  {
    id: 2,
    user_name: 'Você',
    user_id: 2,
    profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    question: 'Existe alguma ferramenta que o senhor recomenda para debug de código JavaScript?',
    created_at: '2025-12-07T09:15:00-03:00',
    current_user: true,
    answer: {
      teacher_name: 'Prof. João Santos',
      teacher_profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
      answer: 'Sim! Recomendo usar o Chrome DevTools para debugging. Além disso, ferramentas como o VS Code têm excelentes recursos de debug integrados. Para aprender mais sobre debugging, sugiro explorar a documentação oficial do Chrome DevTools.',
      answered_at: '2025-12-07T14:20:00-03:00',
    },
  },
  {
    id: 3,
    user_name: 'Você',
    user_id: 2,
    profile_pic_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    question: 'Como posso praticar mais os conceitos apresentados nesta aula?',
    created_at: '2025-12-06T10:20:00-03:00',
    current_user: true,
  },
]

function getInitials(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  const [first, second] = parts
  const initials = `${first?.[0] || ''}${second?.[0] || ''}`
  return initials.toUpperCase() || '?'
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMs / 3600000)
  const diffInDays = Math.floor(diffInMs / 86400000)

  if (diffInMinutes < 1) return 'agora'
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`
  if (diffInHours < 24) return `${diffInHours}h atrás`
  if (diffInDays < 7) return `${diffInDays}d atrás`

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function TeacherQuestions({ lessonId }: TeacherQuestionsProps) {
  const [questions] = useState<Question[]>(MOCK_QUESTIONS)
  const [newQuestion, setNewQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim() || isSubmitting) return

    setIsSubmitting(true)
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1000))
    setNewQuestion('')
    setIsSubmitting(false)
  }

  const totalQuestions = questions.length

  return (
    <Card className="border-border/50">
      <div className="divide-y divide-border/50">
        {/* Header */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">
            Suas Perguntas ao Professor
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalQuestions} {totalQuestions === 1 ? 'pergunta' : 'perguntas'} • Apenas você e o professor podem ver
          </p>
        </div>

        {/* Lista de perguntas */}
        {totalQuestions > 0 && (
          <div className="max-h-[400px] overflow-y-auto">
            {questions.map((question) => (
              <div
                key={question.id}
                className="px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0"
              >
                {/* Pergunta do aluno */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={question.profile_pic_url} alt={question.user_name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(question.user_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">
                        {question.user_name}
                      </p>
                      {question.current_user && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-medium">
                          Você
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(question.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-foreground mt-1 leading-relaxed break-words">
                      {question.question}
                    </p>

                    {/* Resposta do professor */}
                    {question.answer && (
                      <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-muted/20 rounded-r-lg p-3">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={question.answer.teacher_profile_pic_url}
                              alt={question.answer.teacher_name}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(question.answer.teacher_name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-semibold text-foreground">
                                {question.answer.teacher_name}
                              </p>
                              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[9px] font-medium">
                                Professor
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(question.answer.answered_at)}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {question.answer.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Aguardando resposta */}
                    {!question.answer && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        <span>Aguardando resposta do professor</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulário para nova pergunta */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="question" className="text-xs font-medium text-muted-foreground block mb-2">
                Faça uma pergunta ao professor
              </label>
              <textarea
                id="question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Digite sua pergunta aqui..."
                className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {newQuestion.length}/500
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!newQuestion.trim() || isSubmitting}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar Pergunta'}
            </Button>
          </form>
        </div>

        {/* Empty state */}
        {totalQuestions === 0 && (
          <div className="px-4 py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-muted/30 mb-3">
                <MessageCircle className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Você ainda não fez nenhuma pergunta
              </p>
              <p className="text-xs text-muted-foreground">
                Suas perguntas são privadas - apenas você e o professor podem vê-las
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
