'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LessonsList } from './lessons-list'
import { FileText, Download, BookOpen } from 'lucide-react'
import { LessonProgress } from '@/src/features/dashboard/hooks/useEventProgress'

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

export function LessonSidebarTabs({
  lessons,
  currentLessonId,
  supportMaterialUrl,
  exercise,
}: LessonSidebarTabsProps) {
  return (
    <Card className="border-border/50 overflow-hidden bg-background">
      <Tabs defaultValue="conteudo" className="w-full">
        <div className="border-b border-border/50 px-4 pt-4">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="conteudo" className="text-xs">
              Conteúdo
            </TabsTrigger>
            <TabsTrigger
              value="material"
              className="text-xs"
              disabled={!supportMaterialUrl}
            >
              Material
            </TabsTrigger>
            <TabsTrigger
              value="exercicio"
              className="text-xs"
              disabled={!exercise}
            >
              Exercício
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Conteúdo (Lista de Aulas) */}
        <TabsContent value="conteudo" className="m-0 mt-0">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <LessonsList
              lessons={lessons}
              currentLessonId={currentLessonId}
              compact={true}
            />
          </div>
        </TabsContent>

        {/* Tab: Material de Apoio */}
        <TabsContent value="material" className="m-0">
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
        </TabsContent>

        {/* Tab: Exercício */}
        <TabsContent value="exercicio" className="m-0">
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
        </TabsContent>
      </Tabs>
    </Card>
  )
}
