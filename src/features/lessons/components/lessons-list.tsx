'use client'

import { Card } from '@/components/ui/card'
import { PlayCircle, Menu } from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import Link from 'next/link'

interface LessonsListProps {
  lessons: LessonProgress[]
  currentLessonId: number
  compact?: boolean
}

// Função auxiliar para formatar duração (mock por enquanto)
const formatDuration = (index: number) => {
  // Mock de durações - substituir com dados reais quando disponível
  const mockDurations = ['01:53:55', '01:55:10', '01:57:51', '01:59:29', '02:01:15']
  return mockDurations[index % mockDurations.length] || '01:00:00'
}

// Calcular duração total (mock)
const getTotalDuration = (lessons: LessonProgress[]) => {
  // Mock - substituir com cálculo real
  return '07:46:25'
}

export function LessonsList({ lessons, currentLessonId, compact = false }: LessonsListProps) {
  if (!lessons || lessons.length === 0) {
    return (
      <Card className="p-6 border-border/50">
        <div className="text-center space-y-2">
          <PlayCircle className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground">Nenhuma aula disponível</p>
        </div>
      </Card>
    )
  }

  // Pegar o nome do curso da primeira aula
  const courseName = lessons[0]?.course_name || 'Curso'

  // Se for modo compacto, não mostra o Card wrapper nem header
  if (compact) {
    return (
      <div>
        {lessons.map((lesson, index) => {
          const isCurrentLesson = lesson.lesson_id === currentLessonId

          return (
            <Link
              key={lesson.lesson_id}
              href={`/aulas/${lesson.lesson_id}`}
            >
              <div
                className={`px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer border-l-4 ${
                  isCurrentLesson
                    ? 'bg-primary/10 border-l-primary'
                    : 'border-l-transparent hover:bg-muted/50'
                }`}
              >
                {/* Ícone de play */}
                <div className="shrink-0">
                  <div className={`p-1 rounded ${
                    lesson.watched ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <PlayCircle className={`h-4 w-4 ${
                      lesson.watched ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                </div>

                {/* Título da aula */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm line-clamp-2 ${
                    isCurrentLesson ? 'font-medium' : ''
                  }`}>
                    {lesson.lesson_name}
                  </p>
                </div>

                {/* Duração */}
                <div className="shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(index)}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden flex flex-col max-h-[calc(100vh-120px)] bg-background">
      {/* Header fixo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Conteúdo</h2>
          <button className="p-1 hover:bg-muted rounded">
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Info do curso */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium line-clamp-2">{courseName}</h3>
          <p className="text-xs text-muted-foreground">
            {lessons.length} aulas • {getTotalDuration(lessons)}
          </p>
        </div>
      </div>

      {/* Lista com scroll */}
      <div className="flex-1 overflow-y-auto">
        {lessons.map((lesson, index) => {
          const isCurrentLesson = lesson.lesson_id === currentLessonId

          return (
            <Link
              key={lesson.lesson_id}
              href={`/aulas/${lesson.lesson_id}`}
            >
              <div
                className={`px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer border-l-4 ${
                  isCurrentLesson
                    ? 'bg-primary/10 border-l-primary'
                    : 'border-l-transparent hover:bg-muted/50'
                }`}
              >
                {/* Ícone de play */}
                <div className="shrink-0">
                  <div className={`p-1 rounded ${
                    lesson.watched ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <PlayCircle className={`h-4 w-4 ${
                      lesson.watched ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                </div>

                {/* Título da aula */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm line-clamp-2 ${
                    isCurrentLesson ? 'font-medium' : ''
                  }`}>
                    {lesson.lesson_name}
                  </p>
                </div>

                {/* Duração */}
                <div className="shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(index)}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
