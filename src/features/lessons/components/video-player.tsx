"use client"

import { Play, Pause, Volume2, Maximize, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video area mockada */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Play className="w-12 h-12 text-primary" />
          </div>
          <p className="text-white/70 text-sm">Player de vídeo mockado</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer">
          <div className="w-1/3 h-full bg-primary rounded-full" />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            <span className="text-white text-sm ml-2">00:00 / 10:30</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
