'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, MonitorPlay, Menu, ChevronLeft, ChevronRight, ChevronDown, PlayCircle, CheckCircle2, Circle, BookOpen } from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { cn } from '@/lib/utils'


interface Exercise {
  id: number
  name: string
  questions_count: number
}

interface LessonSidebarTabsProps {
  lessons: LessonProgress[]
  currentLessonId: number | null
  supportMaterialUrl?: string
  exercise?: Exercise
  onCollapsedChange?: (collapsed: boolean) => void
  onSelectLesson?: (lessonId: number) => void
}

type TabValue = 'conteudo' | 'material'

// Interface para módulo agrupado
interface ModuleGroup {
  module_id: number
  module_name: string
  lessons: LessonProgress[]
  total_duration: string
  quiz?: {
    id: number
    name: string
    questions_count: number
  }
}

// Função para formatar duração em MM:SS
function formatDuration(minutes: number): string {
  const mins = Math.floor(minutes)
  const secs = Math.floor((minutes - mins) * 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// Função para agrupar aulas por módulo
function groupLessonsByModule(lessons: LessonProgress[]): ModuleGroup[] {
  const modulesMap = new Map<number, ModuleGroup>()

  lessons.forEach((lesson, index) => {
    if (!modulesMap.has(lesson.module_id)) {
      modulesMap.set(lesson.module_id, {
        module_id: lesson.module_id,
        module_name: lesson.module_name,
        lessons: [],
        total_duration: '00:00',
      })
    }

    const module = modulesMap.get(lesson.module_id)!
    module.lessons.push(lesson)

    // Se a aula tem quiz, adicionar ao módulo
    if (lesson.exercise && !module.quiz) {
      module.quiz = {
        id: lesson.exercise.id,
        name: lesson.exercise.name,
        questions_count: lesson.exercise.questions_count,
      }
    }
  })

  // Calcular duração total de cada módulo
  return Array.from(modulesMap.values()).map((module) => {
    const totalMinutes = module.lessons.length * 9 // média de 9 minutos por aula
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    module.total_duration = hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(0).padStart(2, '0')}`

    return module
  })
}

// Componente de módulo expansível
function ModuleItem({
  module,
  index,
  currentLessonId,
  isExpanded,
  onToggle,
  onSelectLesson,
}: {
  module: ModuleGroup
  index: number
  currentLessonId: number | null
  isExpanded: boolean
  onToggle: () => void
  onSelectLesson?: (lessonId: number) => void
}) {
  // Verificar se este módulo contém a aula atual
  const isCurrentModule = module.lessons.some((l) => l.lesson_id === currentLessonId)

  return (
    <div className={cn(
      "border-b border-border/50 last:border-b-0 transition-all",
      isCurrentModule && "bg-primary/5 border-l-2 border-l-primary"
    )}>
      {/* Header do módulo */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full px-4 py-4 flex items-center gap-3 transition-all",
          isCurrentModule
            ? "hover:bg-primary/10"
            : "hover:bg-muted/30"
        )}
      >
        {/* Número do módulo */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
          isCurrentModule
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}>
          {index + 1}
        </div>

        {/* Info do módulo */}
        <div className="flex-1 text-left">
          <h4 className={cn(
            "text-sm font-medium leading-tight",
            isCurrentModule && "text-primary"
          )}>
            {module.module_name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {module.lessons.length} aulas • {module.total_duration}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-all",
            isExpanded && "rotate-180",
            isCurrentModule ? "text-primary" : "text-muted-foreground"
          )}
        />
      </button>

      {/* Lista de aulas (expansível) */}
      {isExpanded && (
        <div className={cn(
          "bg-background border-t border-border/30 animate-in fade-in-0 slide-in-from-top-2 duration-200",
          isCurrentModule && "bg-primary/5"
        )}>
          {module.lessons.map((lesson, lessonIndex) => {
            const isCurrentLesson = lesson.lesson_id === currentLessonId
            // Duração estimada: varia entre 5-15 minutos
            const estimatedDuration = 5 + (lessonIndex % 10)

            return (
              <button
                key={lesson.lesson_id}
                onClick={() => onSelectLesson?.(lesson.lesson_id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 transition-all border-l-2",
                  isCurrentLesson
                    ? "bg-primary/15 border-l-primary hover:bg-primary/20"
                    : "border-l-transparent hover:bg-muted/30"
                )}
              >
                {/* Ícone de status */}
                <div className="flex-shrink-0">
                  {lesson.watched ? (
                    <div className="w-5 h-5 rounded-md border-2 border-green-500 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 fill-green-500" />
                    </div>
                  ) : isCurrentLesson ? (
                    <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                      <PlayCircle className="h-3.5 w-3.5 text-primary fill-primary" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-muted-foreground/30 flex items-center justify-center hover:border-muted-foreground/50 transition-colors">
                      <PlayCircle className="h-3 w-3 text-muted-foreground/60" />
                    </div>
                  )}
                </div>

                {/* Nome da aula */}
                <span className={cn(
                  "text-xs flex-1 text-left leading-snug",
                  isCurrentLesson ? "font-semibold text-primary" : "text-foreground font-medium"
                )}>
                  {lesson.lesson_name}
                </span>

                {/* Duração */}
                <span className={cn(
                  "text-xs flex-shrink-0 font-mono",
                  isCurrentLesson ? "text-primary/80" : "text-muted-foreground"
                )}>
                  {formatDuration(estimatedDuration)}
                </span>
              </button>
            )
          })}

          {/* Quiz do módulo (se existir) */}
          {module.quiz && (
            <button
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 transition-all border-t mt-1",
                "bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10",
                "border-primary/20 hover:border-primary/30"
              )}
              onClick={() => {
                // TODO: Abrir quiz
                console.log('Abrir quiz:', module.quiz?.id)
              }}
            >
              <div className="p-2 rounded-lg bg-primary/15 shrink-0 border border-primary/20">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-primary/70 leading-tight font-medium">
                  Próximo conteúdo - teste teórico
                </p>
                <h4 className="text-sm font-semibold text-foreground leading-tight mt-0.5">
                  {module.quiz.name}
                </h4>
              </div>
              <ChevronRight className="h-4 w-4 text-primary" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function LessonSidebarTabs({
  lessons,
  currentLessonId,
  supportMaterialUrl,
  exercise,
  onCollapsedChange,
  onSelectLesson,
}: LessonSidebarTabsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabValue>('conteudo')

  // Agrupar aulas por módulo
  const modules = groupLessonsByModule(lessons)

  // Inicialmente expandir o módulo que contém a aula atual
  const currentModule = lessons.find((l) => l.lesson_id === currentLessonId)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    new Set(currentModule ? [currentModule.module_id] : [])
  )

  const handleCollapsedChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    onCollapsedChange?.(collapsed)
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  const tabs = [
    {
      value: 'conteudo' as TabValue,
      label: 'Conteúdo',
      icon: MonitorPlay,
      disabled: false,
    },
    {
      value: 'material' as TabValue,
      label: 'Material',
      icon: FileText,
      disabled: !supportMaterialUrl,
    },
  ]

  if (isCollapsed) {
    return (
      <Card className="border-border/50 overflow-hidden bg-background w-16 flex flex-col h-full shadow-md">
        {/* Header colapsado */}
        <div className="p-2 border-b border-border/50 flex justify-center bg-muted/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(false)}
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Ícones verticais */}
        <div className="flex flex-col items-center gap-2 py-4">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!tab.disabled) {
                  setActiveTab(tab.value)
                  handleCollapsedChange(false)
                }
              }}
              disabled={tab.disabled}
              className={cn(
                'h-12 w-12 rounded-lg transition-all relative',
                activeTab === tab.value
                  ? 'bg-primary/15 text-primary shadow-sm'
                  : 'hover:bg-accent/50',
                tab.disabled && 'opacity-40'
              )}
              title={tab.label}
            >
              <tab.icon className="h-5 w-5" />
              {activeTab === tab.value && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
            </Button>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden bg-background flex flex-col h-full shadow-sm">
      {/* Header com tabs - Estilo mais limpo */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between px-4 py-3.5">
          <h3 className="text-base font-bold text-foreground">
            {activeTab === 'conteudo' ? 'Conteúdo' : 'Material'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(true)}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs horizontais - estilo minimalista */}
        <div className="flex bg-background">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => !tab.disabled && setActiveTab(tab.value)}
              disabled={tab.disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold transition-all relative',
                'border-r border-border/30 last:border-r-0',
                activeTab === tab.value
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
                tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab: Conteúdo (Módulos Agrupados) */}
        {activeTab === 'conteudo' && (
          <div>
            {modules.map((module, index) => (
              <ModuleItem
                key={module.module_id}
                module={module}
                index={index}
                currentLessonId={currentLessonId}
                isExpanded={expandedModules.has(module.module_id)}
                onToggle={() => toggleModule(module.module_id)}
                onSelectLesson={onSelectLesson}
              />
            ))}
          </div>
        )}

        {/* Tab: Material de Apoio */}
        {activeTab === 'material' && (
          <div className="p-4">
            {supportMaterialUrl ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card">
                  <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      Material de Apoio
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Documento complementar da aula
                    </p>
                  </div>
                </div>

                <Button
                  variant="default"
                  className="w-full h-11"
                  asChild
                >
                  <a
                    href={supportMaterialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Material
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted/50 mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhum material disponível
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
