"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import VideoPlayer from "./components/video-player"
import LessonsSidebar from "./components/lessons-sidebar"
import LessonTabs from "./components/lesson-tabs"
import Link from "next/link"
import { useState } from "react"

interface LessonDetailProps {
  lessonId: string
}

export default function LessonDetail({ lessonId }: LessonDetailProps) {
  const [showSidebar, setShowSidebar] = useState(true)

  // Mock data para a aula atual
  const currentLesson = {
    id: lessonId,
    title: "Conceitos fundamentais",
    module: "Módulo 1 - Introdução",
    hasPrevious: parseInt(lessonId) > 1,
    hasNext: parseInt(lessonId) < 9,
    previousId: (parseInt(lessonId) - 1).toString(),
    nextId: (parseInt(lessonId) + 1).toString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com título da aula */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {currentLesson.module}
              </p>
              <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden"
            >
              {showSidebar ? "Ocultar" : "Mostrar"} conteúdo
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Área principal - Player e abas */}
          <div className="flex-1 space-y-6">
            {/* Player de vídeo */}
            <VideoPlayer />

            {/* Navegação entre aulas */}
            <div className="flex items-center justify-between">
              {currentLesson.hasPrevious ? (
                <Link href={`/aulas/${currentLesson.previousId}`}>
                  <Button variant="outline">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Aula anterior
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {currentLesson.hasNext && (
                <Link href={`/aulas/${currentLesson.nextId}`}>
                  <Button>
                    Próxima aula
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Abas com informações */}
            <LessonTabs />
          </div>

          {/* Sidebar com lista de aulas */}
          {showSidebar && (
            <div className="lg:block">
              <LessonsSidebar currentLessonId={lessonId} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
