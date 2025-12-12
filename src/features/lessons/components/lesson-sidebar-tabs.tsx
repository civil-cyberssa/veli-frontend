'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, MonitorPlay, Menu, ChevronDown, PlayCircle, CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { cn } from '@/lib/utils'


interface LessonSidebarTabsProps {
  lessons: LessonProgress[]
  currentLessonId: number | null
  supportMaterialUrl?: string
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
      "transition-all rounded-lg mb-2",
      isCurrentModule
        ? "border border-border/40"
        : "border border-transparent"
    )}>
      {/* Header do módulo */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full px-3 py-3 flex items-center gap-3 transition-all rounded-lg cursor-pointer",
          isCurrentModule
            ? "hover:bg-muted/30"
            : "hover:bg-muted/20"
        )}
      >
        {/* Número do módulo */}
        <div className={cn(
          "flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-colors",
          isCurrentModule
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {index + 1}
        </div>

        {/* Info do módulo */}
        <div className="flex-1 text-left">
          <h4 className={cn(
            "text-sm font-medium leading-tight",
            isCurrentModule && "text-foreground"
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
            "h-4 w-4 transition-transform duration-200",
            isExpanded && "rotate-180",
            "text-muted-foreground"
          )}
        />
      </button>

      {/* Lista de aulas (expansível) */}
      {isExpanded && (
        <div className="px-2 pb-2 pt-1 space-y-0.5">
          {module.lessons.map((lesson, lessonIndex) => {
            const isCurrentLesson = lesson.lesson_id === currentLessonId
            // Duração estimada: varia entre 5-15 minutos
            const estimatedDuration = 5 + (lessonIndex % 10)

            return (
              <button
                key={lesson.lesson_id}
                onClick={() => onSelectLesson?.(lesson.lesson_id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all cursor-pointer",
                  isCurrentLesson
                    ? "bg-muted/40"
                    : "hover:bg-muted/30"
                )}
              >
                {/* Ícone de status - 3 estados com animação */}
                <div className="flex-shrink-0 relative">
                  {isCurrentLesson ? (
                    <>
                      <PlayCircle className="h-4 w-4 text-primary animate-pulse relative z-10" />
                      <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                    </>
                  ) : lesson.watched ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/30" />
                  )}
                </div>

                {/* Nome da aula */}
                <span className={cn(
                  "text-sm flex-1 text-left leading-snug",
                  isCurrentLesson
                    ? "font-medium text-foreground"
                    : lesson.watched
                    ? "text-green-600 dark:text-green-500 font-medium"
                    : "text-muted-foreground"
                )}>
                  {lesson.lesson_name}
                </span>

                {/* Duração */}
                <span className={cn(
                  "text-xs flex-shrink-0 font-mono",
                  isCurrentLesson
                    ? "text-muted-foreground"
                    : lesson.watched
                    ? "text-green-600/70 dark:text-green-500/70"
                    : "text-muted-foreground/60"
                )}>
                  {formatDuration(estimatedDuration)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function LessonSidebarTabs({
  lessons,
  currentLessonId,
  supportMaterialUrl,
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
      <Card className="border-border/50 overflow-hidden bg-background w-16 flex flex-col h-full">
        {/* Header colapsado */}
        <div className="p-2 border-b border-border/50 flex justify-center bg-muted/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(false)}
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
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
                'h-11 w-11 rounded-lg transition-all relative',
                activeTab === tab.value
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted/40',
                tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              )}
              title={tab.label}
            >
              <tab.icon className="h-5 w-5" />
              {activeTab === tab.value && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
              )}
            </Button>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden bg-background flex flex-col h-full">
      {/* Header com tabs */}
      <div className="border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-2xl font-semibold text-foreground">
            {activeTab === 'conteudo' ? 'Conteúdo' : 'Material'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(true)}
            className="h-8 w-8 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs horizontais */}
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => !tab.disabled && setActiveTab(tab.value)}
              disabled={tab.disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium transition-all relative',
                activeTab === tab.value
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
                tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="flex-1 overflow-y-auto p-3">
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
          <div className="p-3">
            {supportMaterialUrl ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-card">
                  <div className="p-2 rounded-md bg-primary/10 shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground mb-0.5">
                      Material de Apoio
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Documento complementar da aula
                    </p>
                  </div>
                </div>

                <Button
                  variant="default"
                  className="w-full h-10 cursor-pointer"
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
                <div className="p-3 rounded-full bg-muted/30 mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground/30" />
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