'use client'

import { useEffect, useState } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

interface CourseTourProps {
  /** Executar o tour automaticamente na primeira visita */
  autoStart?: boolean
  /** Callback quando o tour é concluído */
  onComplete?: () => void
  /** Callback quando o tour é pulado */
  onSkip?: () => void
}

const TOUR_COMPLETED_KEY = 'course-tour-completed'

export function CourseTour({
  autoStart = true,
  onComplete,
  onSkip
}: CourseTourProps) {
  const [tourCompleted, setTourCompleted] = useState(true)

  useEffect(() => {
    // Verificar se o tour já foi completado
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY)
    setTourCompleted(!!completed)

    if (!completed && autoStart) {
      // Aguardar um pequeno delay para garantir que a página foi renderizada
      const timer = setTimeout(() => {
        startTour()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [autoStart])

  const startTour = () => {
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
          element: 'body',
          popover: {
            title: 'Bem-vindo ao curso!',
            description: 'Vamos te mostrar rapidamente como funciona esta página. O tour leva apenas 30 segundos.',
            side: 'bottom',
            align: 'center',
          },
        },
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

  // Retornar null se o tour já foi completado
  if (tourCompleted && !autoStart) {
    return null
  }

  return (
    <>
      {/* Botão flutuante para reiniciar o tour */}
      {tourCompleted && (
        <button
          onClick={startTour}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          aria-label="Reiniciar tour"
        >
          <span className="hidden sm:inline">Refazer tour</span>
          <span className="text-lg">?</span>
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
