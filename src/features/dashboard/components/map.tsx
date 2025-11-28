"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, CheckCircle2 } from "lucide-react"
import { useSession } from "next-auth/react"
import React from "react"
import Link from "next/link"
import { useNextAsyncLesson } from "../hooks/useNextAsyncLesson"
import { Badge } from "@/components/ui/badge"

export function WelcomeCard() {
  const { data: session } = useSession()
  const { data: nextLesson, isLoading } = useNextAsyncLesson()

  const firstName = session?.first_name || "aluno"
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short'
  })

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="group relative overflow-hidden  transition-all border-0 shadow-none">
      {/* Vídeo de fundo sutil */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-5 transition-opacity duration-700 group-hover:opacity-10"
        >
          <source
            src="https://cdn.pixabay.com/video/2024/01/28/198570-908276518_large.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      </div>

      {/* Conteúdo */}
      <div className="relative border-0">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Olá, {firstName} 👋</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Continue de onde parou
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm ">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{currentDate}</span>
          </div>
        </div>

        {/* Card do vídeo */}
        {isLoading ? (
          <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm">
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        ) : nextLesson ? (
          <Link href={`/aulas/${nextLesson.lesson_id}`}>
            <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-lg cursor-pointer group/card">
              <div className="relative h-64">
                {/* Vídeo de fundo */}
                <video
                  muted
                  playsInline
                  poster="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
                  className="h-full w-full object-cover"
                  src={nextLesson.video_url}
                />

                {/* Overlay escuro */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Badge de status assistido */}
                {nextLesson.watched && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="flex items-center gap-1 bg-green-500/90 text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      Assistido
                    </Badge>
                  </div>
                )}

                {/* Botão Play centralizado */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="icon"
                    className="h-16 w-16 rounded-full bg-primary shadow-xl transition-all group-hover/card:scale-110 hover:bg-primary/90 active:scale-95"
                    asChild
                  >
                    <div>
                      <Play className="ml-1 h-7 w-7 fill-white text-white" />
                    </div>
                  </Button>
                </div>

                {/* Informações da aula */}
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <Badge variant="outline" className="border-white/30 text-white bg-white/10">
                      {nextLesson.module_name}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatScheduledDate(nextLesson.scheduled_datetime)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                    {nextLesson.lesson_name}
                  </h3>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm">
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center p-6">
              <Play className="h-12 w-12 text-muted-foreground/50" />
              <div>
                <p className="text-lg font-medium">Nenhuma aula disponível</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Aguarde novas aulas serem publicadas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}