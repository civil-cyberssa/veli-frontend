'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, PlayCircle, Star, CheckSquare, FileText } from 'lucide-react'

const ONBOARDING_KEY = 'lesson-page-onboarding-seen'

export function LessonOnboarding() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Verificar se o usuário já viu o onboarding
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY)
    if (!hasSeenOnboarding) {
      // Delay para dar tempo do conteúdo carregar
      setTimeout(() => setIsVisible(true), 500)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem(ONBOARDING_KEY, 'true')
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  if (!isVisible) return null

  const steps = [
    {
      icon: <PlayCircle className="h-12 w-12 text-primary" />,
      title: 'Bem-vindo ao Ambiente de Aprendizagem',
      description: 'Aqui você pode assistir às aulas, avaliar conteúdos e acompanhar seu progresso.',
      highlight: 'Assista ao vídeo da aula no seu próprio ritmo'
    },
    {
      icon: <Star className="h-12 w-12 text-yellow-500" />,
      title: 'Avalie as Aulas',
      description: 'Sua opinião é importante! Avalie cada aula com estrelas e ajude a melhorar o conteúdo.',
      highlight: 'De 1 a 5 estrelas'
    },
    {
      icon: <CheckSquare className="h-12 w-12 text-green-500" />,
      title: 'Acompanhe suas Atividades',
      description: 'No menu lateral você encontra todas as atividades, exercícios e materiais complementares.',
      highlight: 'Marque as atividades como concluídas'
    },
    {
      icon: <FileText className="h-12 w-12 text-blue-500" />,
      title: 'Material de Apoio',
      description: 'Baixe materiais complementares e faça os exercícios para fixar o aprendizado.',
      highlight: 'Tudo em um só lugar'
    }
  ]

  const currentStepData = steps[currentStep]

  return (
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
              {currentStepData.icon}
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {currentStepData.title}
              </h2>
              <p className="text-muted-foreground">
                {currentStepData.description}
              </p>
            </div>

            {/* Highlight */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary">
                💡 {currentStepData.highlight}
              </p>
            </div>

            {/* Indicadores de progresso */}
            <div className="flex justify-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Pular
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep < steps.length - 1 ? 'Próximo' : 'Começar'}
              </Button>
            </div>

            {/* Contador */}
            <p className="text-xs text-muted-foreground">
              {currentStep + 1} de {steps.length}
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
  )
}
