'use client'

import { Card } from '@/components/ui/card'
import { PlayCircle, Menu } from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'

interface LessonsListProps {
  lessons: LessonProgress[]
  currentLessonId: number | null
  compact?: boolean
  onSelectLesson?: (lessonId: number) => void
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
  if (!lessons.length) return '00:00'
  return '07:46:25'
}

export function LessonsList({ lessons, currentLessonId, compact = false, onSelectLesson }: LessonsListProps) {
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

  const modules = lessons.reduce(
    (groups, lesson) => {
      const existing = groups.find((group) => group.moduleId === lesson.module_id)

      if (existing) {
        existing.lessons.push(lesson)
        return groups
      }

      return [
        ...groups,
        {
          moduleId: lesson.module_id,
          moduleName: lesson.module_name,
          lessons: [lesson],
        },
      ]
    },
    [] as { moduleId: number; moduleName: string; lessons: LessonProgress[] }[]
  )

  const handleLessonSelect = (lessonId: number) => {
    onSelectLesson?.(lessonId)
  }

  // Se for modo compacto, não mostra o Card wrapper nem header
  if (compact) {
    return (
      <div className="space-y-4">
        {modules.map((moduleGroup, moduleIndex) => (
          <div key={moduleGroup.moduleId} className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                {moduleIndex + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{moduleGroup.moduleName}</p>
                <p className="text-xs text-muted-foreground">
                  {moduleGroup.lessons.length} {moduleGroup.lessons.length === 1 ? 'aula' : 'aulas'} • {getTotalDuration(moduleGroup.lessons)}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {moduleGroup.lessons.map((lesson, index) => {
                const isCurrentLesson = lesson.lesson_id === currentLessonId

                return (
                  <button
                    key={lesson.lesson_id}
                    type="button"
                    onClick={() => handleLessonSelect(lesson.lesson_id)}
                    className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg border transition-colors text-left ${
                      isCurrentLesson
                        ? 'bg-primary/10 border-primary/40'
                        : 'border-border/50 hover:bg-muted/60'
                    }`}
                  >
                    <div className="shrink-0">
                      <div
                        className={`p-1 rounded ${
                          lesson.watched ? 'bg-primary/20' : 'bg-muted'
                        }`}
                      >
                        <PlayCircle
                          className={`h-4 w-4 ${
                            lesson.watched ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm line-clamp-2 ${
                          isCurrentLesson ? 'font-semibold' : ''
                        }`}
                      >
                        {lesson.lesson_name}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(index)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {modules.map((moduleGroup, moduleIndex) => (
          <div key={moduleGroup.moduleId} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                {moduleIndex + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{moduleGroup.moduleName}</p>
                <p className="text-xs text-muted-foreground">
                  {moduleGroup.lessons.length} {moduleGroup.lessons.length === 1 ? 'aula' : 'aulas'} • {getTotalDuration(moduleGroup.lessons)}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {moduleGroup.lessons.map((lesson, index) => {
                const isCurrentLesson = lesson.lesson_id === currentLessonId

                return (
                  <button
                    key={lesson.lesson_id}
                    type="button"
                    onClick={() => handleLessonSelect(lesson.lesson_id)}
                    className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg border transition-colors text-left ${
                      isCurrentLesson
                        ? 'bg-primary/10 border-primary/40'
                        : 'border-border/50 hover:bg-muted/60'
                    }`}
                  >
                    <div className="shrink-0">
                      <div
                        className={`p-1 rounded ${
                          lesson.watched ? 'bg-primary/20' : 'bg-muted'
                        }`}
                      >
                        <PlayCircle
                          className={`h-4 w-4 ${
                            lesson.watched ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm line-clamp-2 ${
                          isCurrentLesson ? 'font-semibold' : ''
                        }`}
                      >
                        {lesson.lesson_name}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(index)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
