"use client"

import { Check, Lock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Lesson {
  id: string
  title: string
  duration: string
  completed: boolean
  locked: boolean
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

// Mock data
const mockModules: Module[] = [
  {
    id: "1",
    title: "Módulo 1 - Introdução",
    lessons: [
      { id: "1", title: "Apresentação do curso", duration: "10:30", completed: true, locked: false },
      { id: "2", title: "Configuração do ambiente", duration: "15:45", completed: true, locked: false },
      { id: "3", title: "Conceitos fundamentais", duration: "20:15", completed: false, locked: false },
    ]
  },
  {
    id: "2",
    title: "Módulo 2 - Fundamentos",
    lessons: [
      { id: "4", title: "Variáveis e tipos de dados", duration: "18:20", completed: false, locked: false },
      { id: "5", title: "Estruturas de controle", duration: "25:10", completed: false, locked: false },
      { id: "6", title: "Funções e métodos", duration: "22:30", completed: false, locked: true },
    ]
  },
  {
    id: "3",
    title: "Módulo 3 - Avançado",
    lessons: [
      { id: "7", title: "Programação assíncrona", duration: "30:00", completed: false, locked: true },
      { id: "8", title: "Padrões de projeto", duration: "28:45", completed: false, locked: true },
      { id: "9", title: "Boas práticas", duration: "20:00", completed: false, locked: true },
    ]
  }
]

interface LessonsSidebarProps {
  currentLessonId: string
}

export default function LessonsSidebar({ currentLessonId }: LessonsSidebarProps) {
  return (
    <div className="w-full lg:w-80 border rounded-lg bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Conteúdo do curso</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mockModules.reduce((acc, module) => acc + module.lessons.length, 0)} aulas
        </p>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="p-4 space-y-4">
          {mockModules.map((module) => (
            <div key={module.id} className="space-y-2">
              <h3 className="font-medium text-sm">{module.title}</h3>
              <div className="space-y-1">
                {module.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId
                  const isLocked = lesson.locked

                  return (
                    <Link
                      key={lesson.id}
                      href={isLocked ? "#" : `/aulas/${lesson.id}`}
                      className={cn(
                        "block",
                        isLocked && "pointer-events-none opacity-50"
                      )}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-left h-auto py-3 px-3",
                          isActive && "bg-secondary"
                        )}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="mt-0.5">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            ) : lesson.completed ? (
                              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <Play className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">
                              {lesson.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {lesson.duration}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
