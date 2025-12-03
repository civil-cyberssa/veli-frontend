'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, CheckCircle2, XCircle } from 'lucide-react'
import { useExercise, Question, Answer } from '@/src/features/dashboard/hooks/useExercise'
import { useSubmitAnswer } from '@/src/features/dashboard/hooks/useSubmitAnswer'

interface QuizViewProps {
  eventId: number
  exerciseName: string
  onClose: () => void
}

export function QuizView({ eventId, exerciseName, onClose }: QuizViewProps) {
  const { data: exercise, isLoading, refetch } = useExercise(eventId)
  const { submitAnswer, isLoading: isSubmitting } = useSubmitAnswer()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Map<number, {
    answer: 'A' | 'B' | 'C' | 'D'
    isCorrect: boolean
    correctAnswer?: string
  }>>(new Map())

  const currentQuestion = exercise?.questions[currentQuestionIndex]
  const totalQuestions = exercise?.questions.length || 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const hasAnsweredCurrent = currentQuestion ? answeredQuestions.has(currentQuestion.id) : false

  // Carregar respostas já existentes
  useEffect(() => {
    if (exercise?.answers) {
      const answersMap = new Map()
      exercise.answers.forEach(ans => {
        answersMap.set(ans.question_id, {
          answer: ans.answer as 'A' | 'B' | 'C' | 'D',
          isCorrect: ans.is_correct,
        })
      })
      setAnsweredQuestions(answersMap)
    }
  }, [exercise])

  // Selecionar resposta já dada ao mudar de questão
  useEffect(() => {
    if (currentQuestion && answeredQuestions.has(currentQuestion.id)) {
      const previousAnswer = answeredQuestions.get(currentQuestion.id)
      setSelectedAnswer(previousAnswer?.answer || null)
    } else {
      setSelectedAnswer(null)
    }
  }, [currentQuestionIndex, currentQuestion, answeredQuestions])

  const handleSelectAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (hasAnsweredCurrent || isSubmitting) return
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !selectedAnswer || hasAnsweredCurrent || !exercise) return

    // Usar subscription_id do exercício ou valor padrão
    const subscriptionId = exercise.subscription_id || 1

    try {
      const result = await submitAnswer({
        subscriptionId,
        exerciseId: exercise.exercise.id,
        questionId: currentQuestion.id,
        eventId: exercise.event_id,
        answer: selectedAnswer,
      })

      // Atualizar mapa de respostas
      setAnsweredQuestions(prev => {
        const newMap = new Map(prev)
        newMap.set(currentQuestion.id, {
          answer: selectedAnswer,
          isCorrect: result.is_correct,
          correctAnswer: result.correct_answer,
        })
        return newMap
      })

      // Refetch para atualizar score
      await refetch()

      // Avançar automaticamente após 1.5s se não for a última questão
      if (!isLastQuestion) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1)
        }, 1500)
      }
    } catch (err) {
      console.error('Erro ao enviar resposta:', err)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const getOptionClassName = (option: 'A' | 'B' | 'C' | 'D') => {
    const isSelected = selectedAnswer === option

    if (!hasAnsweredCurrent) {
      return cn(
        'w-full flex items-center justify-between gap-4 p-4 rounded-lg transition-all cursor-pointer group',
        'bg-card border border-border/50',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'hover:border-border hover:bg-muted/30'
      )
    }

    const questionAnswer = answeredQuestions.get(currentQuestion!.id)
    const isCorrectAnswer = questionAnswer?.correctAnswer === option
    const isUserAnswer = questionAnswer?.answer === option

    return cn(
      'w-full flex items-center justify-between gap-4 p-4 rounded-lg transition-all',
      'bg-card border',
      isCorrectAnswer && 'border-green-500/50 bg-green-500/5',
      isUserAnswer && !questionAnswer?.isCorrect && 'border-red-500/50 bg-red-500/5',
      !isCorrectAnswer && !isUserAnswer && 'border-border/30 opacity-60'
    )
  }

  const getOptionIcon = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!hasAnsweredCurrent) return null

    const questionAnswer = answeredQuestions.get(currentQuestion!.id)
    const isCorrectAnswer = questionAnswer?.correctAnswer === option
    const isUserAnswer = questionAnswer?.answer === option

    if (isCorrectAnswer) {
      return <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
    }

    if (isUserAnswer && !questionAnswer?.isCorrect) {
      return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
    }

    return null
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando exercício...</p>
        </div>
      </div>
    )
  }

  if (!exercise || !currentQuestion) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Exercício não encontrado</p>
          <Button onClick={onClose}>Voltar</Button>
        </div>
      </div>
    )
  }

  const allQuestionsAnswered = answeredQuestions.size === totalQuestions
  const correctAnswersCount = Array.from(answeredQuestions.values()).filter(a => a.isCorrect).length

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="cursor-pointer"
              >
                <X className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{exercise.exercise.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Questão {currentQuestionIndex + 1} de {totalQuestions}
                </p>
              </div>
            </div>

            {allQuestionsAnswered && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pontuação</p>
                <p className="text-2xl font-bold text-primary">
                  {correctAnswersCount}/{totalQuestions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-3xl space-y-8">
            {/* Question Title */}
            <div>
              <h2 className="text-xl font-normal text-foreground/90 leading-relaxed">
                {currentQuestion.statement || currentQuestion.name}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map((option, index) => {
                const isSelected = selectedAnswer === option
                const answerText = currentQuestion[`answer_${option.toLowerCase()}` as keyof Question] as string

                return (
                  <button
                    key={option}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={hasAnsweredCurrent || isSubmitting}
                    className={getOptionClassName(option)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Radio Button */}
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
                        isSelected
                          ? 'border-primary'
                          : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'
                      )}>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>

                      {/* Answer Text */}
                      <span className="text-base text-left text-foreground/90">
                        {answerText}
                      </span>
                    </div>

                    {/* Right side: Number or Icon */}
                    <div className="flex items-center gap-3">
                      {getOptionIcon(option)}
                      <span className={cn(
                        'text-sm font-medium w-6 h-6 rounded flex items-center justify-center',
                        'bg-muted/50 text-muted-foreground'
                      )}>
                        {index + 1}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Action Buttons */}
            {!hasAnsweredCurrent && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || isSubmitting}
                  className="flex-1 h-12 cursor-pointer"
                  size="lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar resposta'}
                </Button>
                {!isLastQuestion && (
                  <Button
                    onClick={handleNextQuestion}
                    variant="outline"
                    className="cursor-pointer"
                    size="lg"
                  >
                    Pular questão
                  </Button>
                )}
              </div>
            )}

            {/* Feedback after answering */}
            {hasAnsweredCurrent && (
              <div className={cn(
                'p-4 rounded-lg border-2 text-center',
                answeredQuestions.get(currentQuestion.id)?.isCorrect
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              )}>
                <p className={cn(
                  'font-medium',
                  answeredQuestions.get(currentQuestion.id)?.isCorrect
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                )}>
                  {answeredQuestions.get(currentQuestion.id)?.isCorrect
                    ? '✓ Resposta correta!'
                    : '✗ Resposta incorreta'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">
                  {String(currentQuestionIndex + 1).padStart(2, '0')}
                </span>
                {' / '}
                <span className="font-mono">
                  {String(totalQuestions).padStart(2, '0')}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="cursor-pointer"
                >
                  Anterior
                </Button>

                {isLastQuestion && allQuestionsAnswered ? (
                  <Button
                    onClick={onClose}
                    className="cursor-pointer"
                  >
                    Finalizar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="cursor-pointer"
                  >
                    Próxima
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
