'use client'

import { useEffect, useState } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Compass, Video, BookOpen, Star, CheckCircle, FolderOpen, Sparkles } from 'lucide-react'

interface CourseTourProps {
  /** Executar o tour automaticamente na primeira visita */
  autoStart?: boolean
  /** Callback quando o tour é concluído */
  onComplete?: () => void
  /** Callback quando o tour é pulado */
  onSkip?: () => void
}

const TOUR_COMPLETED_KEY = 'course-tour-completed'
const ONBOARDING_COMPLETED_KEY = 'lesson-page-onboarding-seen'

export function CourseTour({
  autoStart = true,
  onComplete,
  onSkip
}: CourseTourProps) {
  const [showWelcome, setShowWelcome] = useState(false)
  const [tourCompleted, setTourCompleted] = useState(true)

  useEffect(() => {
    // Verificar se o tour já foi completado
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY)
    const onboardingSeen = localStorage.getItem(ONBOARDING_COMPLETED_KEY)

    setTourCompleted(!!completed)

    // Só mostrar o tour se o onboarding já foi visto e o tour ainda não foi completado
    if (!completed && autoStart && onboardingSeen) {
      // Aguardar um delay para garantir que o onboarding foi fechado
      const timer = setTimeout(() => {
        setShowWelcome(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [autoStart])

  const handleStartTour = () => {
    setShowWelcome(false)
    // Delay para suavizar a transição
    setTimeout(() => {
      startDriverTour()
    }, 300)
  }

  const handleSkip = () => {
    setShowWelcome(false)
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
    setTourCompleted(true)
    onSkip?.()
  }

  const startDriverTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.7,

      popoverClass: 'tour-popover',

      onDestroyStarted: () => {
        const currentStep = driverObj.getActiveIndex()
        const totalSteps = driverObj.getConfig()?.steps?.length || 0

        // Se chegou ao final ou pulou
        if (currentStep === totalSteps - 1 || !driverObj.hasNextStep()) {
          localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
          setTourCompleted(true)
          onComplete?.()
        } else {
          localStorage.setItem(TOUR_COMPLETED_KEY, 'true')
          setTourCompleted(true)
          onSkip?.()
        }

        driverObj.destroy()
      },

      steps: [
        {
          element: '[data-tour="video-player"]',
          popover: {
            title: '🎥 Player de Vídeo',
            description: 'Aqui você assiste às aulas. Use os controles para pausar, ajustar volume, velocidade e até assistir em tela cheia.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '[data-tour="lesson-sidebar"]',
          popover: {
            title: '📚 Lista de Aulas',
            description: 'Aqui estão todas as aulas do curso organizadas por módulos. Clique em qualquer aula para assistir. O ícone verde indica aulas já assistidas.',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: '[data-tour="lesson-description"]',
          popover: {
            title: '📝 Informações da Aula',
            description: 'Veja o título, descrição e avalie a aula com estrelas. Você também pode deixar comentários sobre a aula aqui.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '[data-tour="mark-watched"]',
          popover: {
            title: '✅ Marcar como Assistida',
            description: 'Ao assistir 90% do vídeo, a aula é marcada automaticamente como assistida. Você também pode marcar manualmente clicando neste botão.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '[data-tour="lesson-sidebar"]',
          popover: {
            title: '📎 Material de Apoio',
            description: 'Na aba "Material", você encontra PDFs e outros arquivos complementares para download. Clique para alternar entre as abas.',
            side: 'left',
            align: 'start',
          },
        },
        {
          element: 'body',
          popover: {
            title: '🚀 Pronto para começar!',
            description: 'Agora você já sabe tudo que precisa. Aproveite o curso e bons estudos!',
            side: 'bottom',
            align: 'center',
          },
        },
      ],

      nextBtnText: 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Entendi! 🎉',
    })

    driverObj.drive()
  }

  const startTourManually = () => {
    setShowWelcome(true)
  }

  return (
    <>
      {/* Tela de Boas-vindas ao Tour */}
      {showWelcome && (
        <>
          {/* Overlay escuro */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fade-in"
            onClick={handleSkip}
          />

          {/* Modal central */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <Card className="relative w-full max-w-lg p-8 animate-scale-in shadow-2xl border-2">
              {/* Botão fechar */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Conteúdo */}
              <div className="text-center space-y-6">
                {/* Ícone */}
                <div className="flex justify-center animate-bounce-slow">
                  <Compass className="h-12 w-12 text-primary" />
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Tour Interativo da Plataforma
                  </h2>
                  <p className="text-muted-foreground">
                    Vamos te mostrar rapidamente os principais recursos desta página de curso em apenas 30 segundos.
                  </p>
                </div>

                {/* Highlight */}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    💡 Aprenda a navegar pela interface e aproveitar ao máximo sua experiência
                  </p>
                </div>

                {/* Preview dos tópicos */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Video className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium">Player</p>
                      <p className="text-muted-foreground">Controles do vídeo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium">Aulas</p>
                      <p className="text-muted-foreground">Lista completa</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium">Avaliação</p>
                      <p className="text-muted-foreground">Comentários</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium">Progresso</p>
                      <p className="text-muted-foreground">Marcar assistida</p>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1"
                  >
                    Pular Tour
                  </Button>
                  <Button
                    onClick={handleStartTour}
                    className="flex-1 gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Começar Tour
                  </Button>
                </div>

                {/* Tempo estimado */}
                <p className="text-xs text-muted-foreground">
                  ⏱️ Duração aproximada: 30 segundos
                </p>
              </div>
            </Card>
          </div>

          {/* Animações customizadas */}
          <style jsx global>{`
            @keyframes bounce-slow {
              0%, 100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-10px);
              }
            }

            .animate-bounce-slow {
              animation: bounce-slow 2s ease-in-out infinite;
            }
          `}</style>
        </>
      )}

      {/* Botão flutuante para reiniciar o tour */}
      {tourCompleted && !showWelcome && (
        <button
          onClick={startTourManually}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          aria-label="Reiniciar tour"
          title="Ver tour interativo"
        >
          <Compass className="h-4 w-4" />
          <span className="hidden sm:inline">Tour interativo</span>
        </button>
      )}
    </>
  )
}

/**
 * Hook para controlar o tour programaticamente
 *
 * @example
 * ```tsx
 * const { startTour, resetTour } = useCourseTour()
 *
 * // Iniciar o tour
 * startTour()
 *
 * // Resetar e permitir que o tour apareça novamente
 * resetTour()
 * ```
 */
export function useCourseTour() {
  const startTour = () => {
    // Remover a flag de tour completado temporariamente
    const wasCompleted = localStorage.getItem(TOUR_COMPLETED_KEY)
    localStorage.removeItem(TOUR_COMPLETED_KEY)

    // Disparar evento customizado para iniciar o tour
    window.dispatchEvent(new CustomEvent('start-course-tour'))

    // Restaurar a flag após um delay
    setTimeout(() => {
      if (wasCompleted) {
        localStorage.setItem(TOUR_COMPLETED_KEY, wasCompleted)
      }
    }, 100)
  }

  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY)
    window.location.reload()
  }

  return { startTour, resetTour }
}
