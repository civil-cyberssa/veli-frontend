'use client'

import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLesson } from '@/src/features/dashboard/hooks/useLesson'
import { LessonRating } from '@/src/features/lessons/components/lesson-rating'
import { ActivitiesSidebar } from '@/src/features/lessons/components/activities-sidebar'
import { PlayCircle, FileText, Download, Calendar } from 'lucide-react'

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id as string

  const { data: lesson, isLoading, error } = useLesson(lessonId)

  const handleRatingChange = async (rating: number) => {
    // TODO: Implementar chamada à API para salvar o rating
    console.log('Rating changed to:', rating)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground">Carregando aula...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-destructive">Erro ao carregar aula: {error.message}</p>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-sm text-muted-foreground">Aula não encontrada</p>
      </div>
    )
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {lesson.module.name}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Aula {lesson.order}
          </Badge>
          {lesson.is_weekly && (
            <Badge variant="default" className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Semanal
            </Badge>
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {lesson.lesson_type === 'asynchronous' ? 'Assíncrona' : 'Ao vivo'}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lesson.lesson_name}
        </h1>
      </div>

      {/* Layout: Vídeo + Rating à esquerda | Atividades à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal: Vídeo + Rating + Material */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vídeo */}
          <Card className="border-border/50 overflow-hidden">
            <div className="relative aspect-video bg-black">
              {lesson.content_url ? (
                <video
                  controls
                  className="w-full h-full"
                  src={lesson.content_url}
                  poster=""
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <PlayCircle className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground">Vídeo não disponível</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Rating */}
          <LessonRating
            initialRating={lesson.rating}
            onRatingChange={handleRatingChange}
          />

          {/* Material de Apoio */}
          {lesson.support_material_url && (
            <Card className="p-4 border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Material de Apoio</h3>
                    <p className="text-xs text-muted-foreground">
                      Documento complementar da aula
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={lesson.support_material_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </a>
                </Button>
              </div>
            </Card>
          )}

          {/* Informações do Exercício */}
          {lesson.exercise && (
            <Card className="p-4 border-border/50 bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-1">{lesson.exercise.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Este exercício contém {lesson.exercise.questions_count} questões
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar: Atividades */}
        <div className="lg:col-span-1">
          <ActivitiesSidebar activities={lesson.activities || []} />
        </div>
      </div>
    </div>
  )
}
