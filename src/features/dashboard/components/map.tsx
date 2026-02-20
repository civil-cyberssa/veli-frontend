"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, CheckCircle2 } from "lucide-react"
import { useSession } from "next-auth/react"
import React from "react"
import Link from "next/link"
import { useNextAsyncLesson } from "../hooks/useNextAsyncLesson"
import { Badge } from "@/components/ui/badge"
import { LogoPulseLoader } from "@/components/shared/logo-loader"

export function WelcomeCard() {
  const { data: session } = useSession()
  const { data: nextLesson, isLoading } = useNextAsyncLesson()

  const fullName = session?.student_full_name
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
            <h2 className="text-2xl font-semibold">
              {fullName ? `Olá, ${fullName}` : "Olá!"}
            </h2>
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
            <div className="flex h-72 md:h-80 items-center justify-center bg-muted">
              <LogoPulseLoader label="Carregando próxima aula..." />
            </div>
          </div>
        ) : nextLesson ? (
          <Link href={`/course/${nextLesson.student_class_id}`} className="block">
            <div className="relative overflow-hidden rounded-2xl bg-card shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer group/card">
              <div className="relative h-72 md:h-80">
                {/* Vídeo de fundo - usa a própria thumbnail do vídeo */}
                <video
                  preload="metadata"
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  src={nextLesson.video_url}
                />

                {/* Overlay escuro com gradient melhorado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

                {/* Badge de status assistido */}
                {nextLesson.watched && (
                  <div className="absolute top-5 right-5 z-10">
                    <Badge variant="secondary" className="flex items-center gap-1.5 bg-green-500/95 text-white shadow-lg backdrop-blur-sm px-3 py-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="font-medium">Assistido</span>
                    </Badge>
                  </div>
                )}

                {/* Botão Play centralizado com animação melhorada */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="relative">
                    {/* Pulse ring effect */}
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                    <Button
                      size="icon"
                      className="relative h-20 w-20 rounded-full bg-primary/95 backdrop-blur-sm shadow-2xl transition-all duration-300 group-hover/card:scale-125 group-hover/card:bg-primary hover:rotate-12 active:scale-95"
                      asChild
                    >
                      <div>
                        <Play className="ml-1.5 h-9 w-9 fill-white text-white" />
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Informações da aula com melhor hierarquia visual */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3 z-10">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      variant="outline"
                      className="border-white/40 text-white bg-white/15 backdrop-blur-md font-medium px-3 py-1"
                    >
                      {nextLesson.module_name}
                    </Badge>
                    <span className="flex items-center gap-1.5 text-white/90 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">{formatScheduledDate(nextLesson.scheduled_datetime)}</span>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl leading-tight">
                      {nextLesson.lesson_name}
                    </h3>
                    <p className="text-sm text-white/80 mt-1 font-medium">
                      Clique para assistir à aula
                    </p>
                  </div>
                </div>

                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-primary/0 group-hover/card:bg-primary/10 transition-colors duration-300" />
              </div>
            </div>
          </Link>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm border-2 border-dashed border-muted">
            <div className="flex h-72 md:h-80 flex-col items-center justify-center gap-4 text-center p-6">
              <div className="rounded-full bg-muted p-6">
                <Play className="h-12 w-12 text-muted-foreground/60" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-foreground">Nenhuma aula disponível</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Aguarde novas aulas serem publicadas ou entre em contato com seu instrutor
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
