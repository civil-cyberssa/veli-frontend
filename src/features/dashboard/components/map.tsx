"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import React from "react"

export function WelcomeCard() {
  const { data: session } = useSession()
  const [isPlaying, setIsPlaying] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  
  const firstName = session?.first_name || "aluno"
  const currentDate = new Date().toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'short' 
  })

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
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
        <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm">
          <div className="relative h-64">
            {/* Vídeo com poster */}
            <video
              ref={videoRef}
              controls={isPlaying}
              poster="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
              className="h-full w-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
            </video>

            {/* Botão Play */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  size="icon" 
                  onClick={handlePlayVideo}
                  className="h-16 w-16 rounded-full bg-primary shadow-xl transition-all hover:scale-110 hover:bg-primary/90 active:scale-95"
                >
                  <Play className="ml-1 h-7 w-7 fill-white text-white" />
                </Button>
              </div>
            )}

            {/* Título */}
            {!isPlaying && (
              <div className="absolute bottom-5 left-5">
                <h3 className="text-lg font-semibold text-white drop-shadow-lg">
                  Vídeo da semana
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}