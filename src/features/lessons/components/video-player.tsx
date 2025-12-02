'use client'

import { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
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
  Settings,
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
}

export function VideoPlayer({ url, poster, onProgress, onEnded }: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isReady, setIsReady] = useState(false)

  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

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
    setPlaying(!playing)
  }

  const handleProgress = (state: any) => {
    setPlayed(state.played)
    onProgress?.({ played: state.played, playedSeconds: state.playedSeconds })
  }

  const handleSeek = (value: number[]) => {
    const seekTo = value[0] / 100
    setPlayed(seekTo)
    playerRef.current?.seekTo(seekTo)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    setMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setMuted(!muted)
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const skipBackward = () => {
    const current = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(Math.max(0, current - 10))
  }

  const skipForward = () => {
    const current = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(Math.min(duration, current + 10))
  }

  const formatTime = (seconds: number) => {
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
    <Card className="border-border/50 overflow-hidden bg-black group">
      <div
        ref={containerRef}
        className="relative aspect-video bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        {/* @ts-ignore */}
        <ReactPlayer
          ref={playerRef}
          url={url}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          width="100%"
          height="100%"
          onReady={() => setIsReady(true)}
          onProgress={handleProgress}
          onDuration={setDuration}
          onEnded={onEnded}
        />

        {/* Loading spinner */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}

        {/* Center play button overlay */}
        {!playing && isReady && (
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
              value={[played * 100]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs text-white mt-1">
              <span>{formatTime(played * duration)}</span>
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
                {playing ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
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
