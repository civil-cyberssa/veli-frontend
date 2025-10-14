"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

export function WelcomeCard() {
  const { data: session } = useSession()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  const firstName = session?.first_name || "aluno"

  const handlePlayVideo = () => {
    setIsPlaying(true)
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    const video = document.getElementById('preview-video') as HTMLVideoElement
    if (video && !isPlaying) {
      video.currentTime = 0
      video.play()
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    const video = document.getElementById('preview-video') as HTMLVideoElement
    if (video && !isPlaying) {
      video.pause()
      video.currentTime = 0
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div 
        className="relative h-[28rem] bg-muted"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {!isPlaying ? (
          <>
            {/* Thumbnail do vídeo esticado */}
            <video
              id="preview-video"
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              playsInline
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
            </video>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Badge */}
            <div className="absolute left-4 top-4">
              <Badge variant="secondary" className="backdrop-blur-sm">
                Novo
              </Badge>
            </div>

            {/* Botão play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={handlePlayVideo}
                className={`h-16 w-16 rounded-full transition-transform ${
                  isHovering ? 'scale-110' : 'scale-100'
                }`}
              >
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              </Button>
            </div>

            {/* Informações */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    10:42
                  </Badge>
                  <span>Conversação</span>
                </div>
                
                <h3 className="text-xl font-semibold">
                  Vídeo da semana
                </h3>
                
                <p className="text-sm text-muted-foreground">
                  No restaurante
                </p>
              </div>
            </div>
          </>
        ) : (
          <video
            className="h-full w-full object-cover"
            controls
            autoPlay
          >
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              type="video/mp4"
            />
          </video>
        )}
      </div>
    </Card>
  )
}