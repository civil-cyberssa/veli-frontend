'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LessonsList } from './lessons-list'
import { FileText, Download, BookOpen, MonitorPlay, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'
import { cn } from '@/lib/utils'

interface Exercise {
  id: number
  name: string
  questions_count: number
}

interface LessonSidebarTabsProps {
  lessons: LessonProgress[]
  currentLessonId: number
  supportMaterialUrl?: string
  exercise?: Exercise
}

type TabValue = 'conteudo' | 'material' | 'exercicio'

export function LessonSidebarTabs({
  lessons,
  currentLessonId,
  supportMaterialUrl,
  exercise,
}: LessonSidebarTabsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<TabValue>('conteudo')

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
      <Card className="border-border/50 overflow-hidden bg-background w-16 flex flex-col">
        {/* Header colapsado */}
        <div className="p-2 border-b border-border/50 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Ícones verticais */}
        <div className="flex flex-col items-center gap-2 py-4">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                if (!tab.disabled) {
                  setActiveTab(tab.value)
                  setIsCollapsed(false)
                }
              }}
              disabled={tab.disabled}
              className={cn(
                'h-10 w-10',
                activeTab === tab.value && 'bg-primary text-primary-foreground'
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
    <Card className="border-border/50 overflow-hidden bg-background">
      {/* Header com tabs */}
      <div className="border-b border-border/50 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Navegação</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-6 w-6"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => !tab.disabled && setActiveTab(tab.value)}
              disabled={tab.disabled}
              className={cn(
                'flex-1 text-xs h-8',
                activeTab === tab.value && 'bg-primary text-primary-foreground'
              )}
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
        {/* Tab: Conteúdo (Lista de Aulas) */}
        {activeTab === 'conteudo' && (
          <div>
            <LessonsList
              lessons={lessons}
              currentLessonId={currentLessonId}
              compact={true}
            />
          </div>
        )}

        {/* Tab: Material de Apoio */}
        {activeTab === 'material' && (
          <div className="p-4 space-y-3">
            {supportMaterialUrl ? (
              <Card className="p-4 border-border/50">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">Material de Apoio</h3>
                      <p className="text-xs text-muted-foreground">
                        Documento complementar da aula
                      </p>
                    </div>
                  </div>
                  <Button variant="default" size="sm" className="w-full" asChild>
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
              </Card>
            ) : (
              <div className="text-center py-8 space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Nenhum material disponível
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Exercício */}
        {activeTab === 'exercicio' && (
          <div className="p-4 space-y-3">
            {exercise ? (
              <Card className="p-4 border-border/50 bg-muted/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium">{exercise.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {exercise.questions_count} questões
                      </p>
                    </div>
                  </div>
                  <Button variant="default" size="sm" className="w-full">
                    Iniciar Exercício
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="text-center py-8 space-y-2">
                <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
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
