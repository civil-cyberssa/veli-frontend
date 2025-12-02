'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LessonsList } from './lessons-list'
import { FileText, Download, BookOpen, MonitorPlay, ChevronLeft, ChevronRight, Award } from 'lucide-react'
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

type TabValue = 'conteudo' | 'material' | 'exercicio'

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
  const handleCollapsedChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    onCollapsedChange?.(collapsed)
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
    {
      value: 'exercicio' as TabValue,
      label: 'Exercício',
      icon: BookOpen,
      disabled: !exercise,
    },
  ]

  if (isCollapsed) {
    return (
      <Card className="border-border/50 overflow-hidden bg-background w-16 flex flex-col h-full">
        {/* Header colapsado */}
        <div className="p-2 border-b border-border/50 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(false)}
            className="h-8 w-8 hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Ícones verticais */}
        <div className="flex flex-col items-center gap-1 py-3">
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
                'h-12 w-12 rounded-lg transition-all',
                activeTab === tab.value 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary rounded-l-none' 
                  : 'hover:bg-accent',
                tab.disabled && 'opacity-40'
              )}
              title={tab.label}
            >
              <tab.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden bg-background flex flex-col h-full">
      {/* Header com tabs - Estilo mais limpo */}
      <div className="border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-base font-semibold text-foreground">
            {activeTab === 'conteudo' ? 'Conteúdo' : activeTab === 'material' ? 'Material' : 'Exercício'}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(true)}
            className="h-8 w-8 hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs horizontais - estilo minimalista */}
        <div className="flex border-t border-border/30">
          {tabs.map((tab, index) => (
            <button
              key={tab.value}
              onClick={() => !tab.disabled && setActiveTab(tab.value)}
              disabled={tab.disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all relative',
                'border-r border-border/30 last:border-r-0',
                activeTab === tab.value
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground'
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
      <div className="flex-1 overflow-y-auto">
        {/* Tab: Conteúdo (Lista de Aulas) */}
        {activeTab === 'conteudo' && (
          <div className="p-4">
            <LessonsList
              lessons={lessons}
              currentLessonId={currentLessonId}
              compact={true}
              onSelectLesson={onSelectLesson}
            />
            
            {/* Seção de certificado ao final */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <button 
                className="w-full flex items-center justify-center gap-3 p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors group"
                disabled
              >
                <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                  <Award className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Emitir certificado
                </span>
              </button>
            </div>
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

        {/* Tab: Exercício */}
        {activeTab === 'exercicio' && (
          <div className="p-4">
            {exercise ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card">
                  <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      {exercise.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {exercise.questions_count} {exercise.questions_count === 1 ? 'questão' : 'questões'}
                    </p>
                  </div>
                </div>
                
                <Button variant="default" className="w-full h-11">
                  Iniciar Exercício
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted/50 mb-3">
                  <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Nenhum exercício disponível
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}