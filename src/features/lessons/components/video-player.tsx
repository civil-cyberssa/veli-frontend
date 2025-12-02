'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  url: string
  poster?: string
  onProgress?: (progress: { played: number; playedSeconds: number }) => void
  onEnded?: () => void
  autoPlay?: boolean
}

export function VideoPlayer({ url, poster, onProgress, onEnded, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const [playing, setPlaying] = useState(autoPlay)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

  // Atualizar volume do vídeo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = muted
    }
  }, [volume, muted])

  // Atualizar playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Auto play control
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (autoPlay) {
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false))
      }
    } else {
      video.pause()
      setPlaying(false)
    }
  }, [autoPlay, url])

  // Listener para fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Iniciar/parar intervalo de progresso
  useEffect(() => {
    if (playing) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          const current = videoRef.current.currentTime
          const dur = videoRef.current.duration
          setCurrentTime(current)

          if (dur > 0) {
            onProgress?.({
              played: current / dur,
              playedSeconds: current,
            })
          }
        }
      }, 1000)
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [playing, onProgress])

  const handleMouseMove = () => {
    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    if (playing) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const handlePlayPause = () => {
    if (!videoRef.current) return

    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    const seekTime = (value[0] / 100) * duration
    videoRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    setMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (muted) {
      setMuted(false)
      setVolume(0.8)
    } else {
      setMuted(true)
    }
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const skipBackward = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
  }

  const skipForward = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10)
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'

    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

  return (
    <Card className="border-border/50 overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="relative aspect-video bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          className="w-full h-full"
          autoPlay={autoPlay}
          onLoadedMetadata={(e) => {
            const target = e.target as HTMLVideoElement
            setDuration(target.duration)
            setIsLoading(false)
          }}
          onTimeUpdate={(e) => {
            const target = e.target as HTMLVideoElement
            setCurrentTime(target.currentTime)
          }}
          onEnded={() => {
            setPlaying(false)
            onEnded?.()
          }}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => {
            setIsLoading(false)

            if (autoPlay && !playing) {
              const playPromise = videoRef.current?.play()
              if (playPromise) {
                playPromise
                  .then(() => setPlaying(true))
                  .catch(() => setPlaying(false))
              }
            }
          }}
          playsInline
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}

        {/* Center play button */}
        {!playing && !isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer transition-opacity hover:bg-black/30"
            onClick={handlePlayPause}
          >
            <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl hover:bg-primary transition-colors">
              <Play className="h-10 w-10 text-primary-foreground ml-1" />
            </div>
          </div>
        )}

        {/* Controls */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transition-opacity duration-300',
            showControls || !playing ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Progress bar */}
          <div className="mb-4">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs text-white mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayPause}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              {/* Skip backward */}
              <Button
                variant="ghost"
                size="icon"
                onClick={skipBackward}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              {/* Skip forward */}
              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-20 hidden sm:block">
                  <Slider
                    value={[muted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback speed */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-white hover:bg-white/20 text-xs"
                  >
                    {playbackRate}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {playbackRates.map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => setPlaybackRate(rate)}
                      className={cn(
                        'cursor-pointer',
                        rate === playbackRate && 'bg-primary text-primary-foreground'
                      )}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
