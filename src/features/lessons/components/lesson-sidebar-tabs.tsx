'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Download,
  MonitorPlay,
  Menu,
  ChevronDown,
  PlayCircle,
  CheckCircle2,
  Circle,
  ChevronRight
} from 'lucide-react'
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

  lessons.forEach((lesson) => {
    if (!modulesMap.has(lesson.module_id)) {
      modulesMap.set(lesson.module_id, {
        module_id: lesson.module_id,
        module_name: lesson.module_name,
        lessons: [],
        total_duration: '00:00',
      })
    }

    const moduleGroup = modulesMap.get(lesson.module_id)!
    moduleGroup.lessons.push(lesson)
  })

  // Calcular duração total de cada módulo
  return Array.from(modulesMap.values()).map((moduleGroup) => {
    const totalMinutes = moduleGroup.lessons.length * 9 // média de 9 minutos por aula
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    moduleGroup.total_duration = hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(0).padStart(2, '0')}`

    return moduleGroup
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
  const completedCount = module.lessons.filter(l => l.watched).length
  const totalCount = module.lessons.length
  const progress = (completedCount / totalCount) * 100

  return (
    <div className={cn(
      "transition-all rounded-lg mb-2 overflow-hidden",
      "border",
      isCurrentModule
        ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-sm"
        : "border-border/30 hover:border-border/50"
    )}>
      {/* Header do módulo */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full px-3 py-3 flex items-center gap-3 transition-all cursor-pointer group",
          isCurrentModule
            ? "hover:bg-primary/5"
            : "hover:bg-muted/20"
        )}
      >
        {/* Número do módulo */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
          "shadow-sm group-hover:scale-105",
          isCurrentModule
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
            : "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground"
        )}>
          {index + 1}
        </div>

        {/* Info do módulo */}
        <div className="flex-1 text-left">
          <h4 className={cn(
            "text-sm font-semibold leading-tight transition-colors",
            isCurrentModule ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
          )}>
            {module.module_name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {module.lessons.length} aulas • {module.total_duration}
            </p>
            {progress > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {Math.round(progress)}%
              </Badge>
            )}
          </div>
        </div>

        {/* Chevron com animação */}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-all duration-300",
            isExpanded && "rotate-180",
            "text-muted-foreground group-hover:text-foreground"
          )}
        />
      </button>

      {/* Barra de progresso */}
      {progress > 0 && (
        <div className="px-3 pb-2">
          <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de aulas (expansível) */}
      {isExpanded && (
        <div className="px-2 pb-2 pt-1 space-y-0.5 animate-in slide-in-from-top-2 duration-300">
          {module.lessons.map((lesson, lessonIndex) => {
            const isCurrentLesson = lesson.lesson_id === currentLessonId
            const estimatedDuration = 5 + (lessonIndex % 10)

            return (
              <button
                key={lesson.lesson_id}
                onClick={() => onSelectLesson?.(lesson.lesson_id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group/lesson",
                  "border border-transparent",
                  isCurrentLesson
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-sm"
                    : "hover:bg-muted/40 hover:border-border/30"
                )}
              >
                {/* Ícone de status - 3 estados com animação */}
                <div className="flex-shrink-0 relative">
                  {isCurrentLesson ? (
                    <>
                      <PlayCircle className="h-5 w-5 text-primary animate-pulse relative z-10" />
                      <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
                    </>
                  ) : lesson.watched ? (
                    <div className="relative">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40 group-hover/lesson:text-muted-foreground/60 transition-colors" />
                  )}
                </div>

                {/* Nome da aula */}
                <span className={cn(
                  "text-sm flex-1 text-left leading-snug transition-colors",
                  isCurrentLesson
                    ? "font-semibold text-foreground"
                    : lesson.watched
                    ? "text-green-700 dark:text-green-400 font-medium"
                    : "text-muted-foreground group-hover/lesson:text-foreground"
                )}>
                  {lesson.lesson_name}
                </span>

                {/* Duração */}
                <span className={cn(
                  "text-xs flex-shrink-0 font-mono tabular-nums",
                  isCurrentLesson
                    ? "text-primary/70 font-medium"
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
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      value: 'material' as TabValue,
      label: 'Material',
      icon: FileText,
      disabled: !supportMaterialUrl,
      gradient: 'from-green-500 to-green-600',
    },
  ]

  if (isCollapsed) {
    return (
      <Card className="border-border/50 overflow-hidden bg-background w-16 flex flex-col h-full shadow-lg">
        {/* Header colapsado */}
        <div className="p-2 border-b border-border/50 flex justify-center bg-gradient-to-b from-muted/30 to-transparent">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(false)}
            className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-all hover:scale-110 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Ícones verticais */}
        <div className="flex flex-col items-center gap-3 py-4">
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
                'h-12 w-12 rounded-xl transition-all relative group',
                activeTab === tab.value
                  ? 'bg-gradient-to-br shadow-md scale-105'
                  : 'hover:bg-muted/40 hover:scale-105',
                activeTab === tab.value && tab.gradient,
                tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              )}
              title={tab.label}
            >
              <tab.icon className={cn(
                "h-5 w-5 transition-all",
                activeTab === tab.value ? "text-white" : "text-foreground"
              )} />
              {activeTab === tab.value && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary via-primary to-transparent rounded-r-full shadow-lg" />
              )}
            </Button>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden bg-background flex flex-col h-full shadow-lg">
      {/* Header com tabs */}
      <div className="border-b border-border/50 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            {activeTab === 'conteudo' && 'Conteúdo do Curso'}
            {activeTab === 'material' && 'Material de Apoio'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(true)}
            className="h-8 w-8 hover:bg-muted/40 transition-all hover:scale-110 cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs horizontais */}
        <div className="flex px-2 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => !tab.disabled && setActiveTab(tab.value)}
              disabled={tab.disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium transition-all relative rounded-t-lg group',
                activeTab === tab.value
                  ? 'text-foreground bg-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
                tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              <tab.icon className={cn(
                "h-4 w-4 transition-all",
                activeTab === tab.value && "text-primary"
              )} />
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.value && (
                <div className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r",
                  tab.gradient
                )} />
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
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border/40 bg-gradient-to-br from-card to-muted/20 shadow-sm">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 shrink-0">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      Material de Apoio
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Documento complementar para aprofundar seus estudos
                    </p>
                  </div>
                </div>

                <Button
                  variant="default"
                  className="w-full h-11 cursor-pointer bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
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
                <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/20 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Nenhum material disponível
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Material de apoio aparecerá aqui quando disponível
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
