'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Compass, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

const TOUR_COMPLETED_KEY = 'course-tour-completed'
const ONBOARDING_COMPLETED_KEY = 'lesson-page-onboarding-seen'

interface TourStep {
  target: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="video-player"]',
    title: '🎥 Player de Vídeo',
    description: 'Assista às aulas aqui. Use os controles para pausar, ajustar volume e velocidade.',
    position: 'bottom',
  },
  {
    target: '[data-tour="lesson-sidebar"]',
    title: '📚 Lista de Aulas',
    description: 'Todas as aulas organizadas por módulos. O ícone verde indica aulas já assistidas.',
    position: 'left',
  },
  {
    target: '[data-tour="lesson-description"]',
    title: '📝 Avalie a Aula',
    description: 'Deixe sua avaliação com estrelas e comentários sobre a aula.',
    position: 'top',
  },
  {
    target: '[data-tour="mark-watched"]',
    title: '✅ Marcar como Assistida',
    description: 'A aula é marcada automaticamente ao assistir 90%, ou clique aqui manualmente.',
    position: 'top',
  },
]

export function CourseTour() {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY)
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY)

    if (!tourCompleted && onboardingCompleted) {
      setTimeout(() => {
        setShowWelcome(true)
      }, 1500)
    }
  }, [])

  const startTour = () => {
    setShowWelcome(false)
    setIsActive(true)
    setCurrentStep(0)
  }

  const skipTour = () => {
    setShowWelcome(false)
    setIsActive(false)
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    setIsActive(false)
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
  }

  const restartTour = () => {
    setShowWelcome(true)
  }

  useEffect(() => {
    if (isActive) {
      const target = document.querySelector(
        tourSteps[currentStep].target,
      ) as HTMLElement | null

      setTargetElement(target)
    } else {
      setTargetElement(null)
      setTargetRect(null)
    }
  }, [isActive, currentStep])

  useEffect(() => {
    if (!targetElement) return

    const updateRect = () => {
      const rect = targetElement.getBoundingClientRect()
      setTargetRect(rect)
    }

    const handleScroll = () => {
      requestAnimationFrame(updateRect)
    }

    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })

    updateRect()

    const resizeObserver = new ResizeObserver(updateRect)
    resizeObserver.observe(targetElement)

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', updateRect)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [targetElement])

  if (!isActive && !showWelcome) {
    return (
      <button
        onClick={restartTour}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl active:scale-95"
        aria-label="Iniciar tour"
      >
        <Compass className="h-4 w-4" />
        <span className="hidden sm:inline">Tour</span>
      </button>
    )
  }

  if (showWelcome) {
    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
          onClick={skipTour}
        />

        {/* Welcome Card */}
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <Card className="relative w-full max-w-md p-6 animate-in zoom-in-95 duration-300 bg-card text-card-foreground">
            <button
              onClick={skipTour}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <Compass className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-2">Tour Rápido</h2>
                <p className="text-sm text-muted-foreground">
                  Conheça os principais recursos desta página em 30 segundos
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={skipTour}
                  className="flex-1"
                >
                  Pular
                </Button>
                <Button
                  onClick={startTour}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Começar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </>
    )
  }

  const step = tourSteps[currentStep]

  if (!targetRect) return null

  const getPopoverStyle = () => {
    if (step.position === 'bottom' || step.position === 'top') {
      return {
        top:
          step.position === 'bottom'
            ? targetRect.bottom + 16
            : targetRect.top - 16,
        left: targetRect.left + targetRect.width / 2,
        transform: step.position === 'top' ? 'translate(-50%, -100%)' : 'translateX(-50%)',
      }
    }

    return {
      top: targetRect.top + targetRect.height / 2,
      left:
        step.position === 'left'
          ? targetRect.left - 360
          : targetRect.right + 16,
      transform: 'translateY(-50%)',
    }
  }

  const highlightPadding = 12
  const highlightBox = {
    top: targetRect.top - highlightPadding,
    left: targetRect.left - highlightPadding,
    width: targetRect.width + highlightPadding * 2,
    height: targetRect.height + highlightPadding * 2,
  }

  return (
    <>
      {/* Overlay com recorte e blur */}
      <div
        className="fixed inset-0 z-[100] animate-in fade-in duration-300"
        style={{
          top: 0,
          left: 0,
          boxShadow: `0 0 0 9999px hsl(var(--foreground) / 0.65)`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 12,
          width: highlightBox.width,
          height: highlightBox.height,
          transform: `translate(${highlightBox.left}px, ${highlightBox.top}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Highlight do elemento */}
      <div
        className="fixed z-[101] rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-background transition-all duration-300"
        style={{
          top: highlightBox.top,
          left: highlightBox.left,
          width: highlightBox.width,
          height: highlightBox.height,
          pointerEvents: 'none',
        }}
      />

      {/* Popover Card */}
      <div
        className="fixed z-[102] w-80 animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{
          ...getPopoverStyle(),
          maxWidth: 'calc(100vw - 2rem)',
        }}
      >
        <Card className="p-5 bg-card text-card-foreground shadow-2xl border-2 border-border">
          <button
            onClick={skipTour}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="space-y-3 pr-6">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground">
              {currentStep + 1} de {tourSteps.length}
            </span>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Anterior
                </Button>
              )}

              <Button
                size="sm"
                onClick={nextStep}
                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Concluir
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-3 w-3" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
