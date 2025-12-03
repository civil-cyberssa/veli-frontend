'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, X, CheckCircle2, XCircle } from 'lucide-react'
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
  const [showResult, setShowResult] = useState(false)

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
    if (!currentQuestion || !selectedAnswer || hasAnsweredCurrent) return

    try {
      const result = await submitAnswer({
        eventId,
        questionId: currentQuestion.id,
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

  const handleSkipQuestion = () => {
    if (!isLastQuestion) {
      handleNextQuestion()
    }
  }

  const getAnswerClassName = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!hasAnsweredCurrent) {
      return cn(
        'w-full p-4 text-left border-2 rounded-lg transition-all cursor-pointer',
        'hover:border-primary/50 hover:bg-primary/5',
        selectedAnswer === option
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border/50 bg-card'
      )
    }

    const questionAnswer = answeredQuestions.get(currentQuestion!.id)
    const isSelected = questionAnswer?.answer === option
    const isCorrectAnswer = questionAnswer?.correctAnswer === option

    return cn(
      'w-full p-4 text-left border-2 rounded-lg transition-all',
      isCorrectAnswer && 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400',
      isSelected && !questionAnswer?.isCorrect && 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
      !isSelected && !isCorrectAnswer && 'border-border/30 bg-card/50 opacity-60 cursor-not-allowed'
    )
  }

  const getAnswerIcon = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!hasAnsweredCurrent) return null

    const questionAnswer = answeredQuestions.get(currentQuestion!.id)
    const isSelected = questionAnswer?.answer === option
    const isCorrectAnswer = questionAnswer?.correctAnswer === option

    if (isCorrectAnswer) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    }

    if (isSelected && !questionAnswer?.isCorrect) {
      return <XCircle className="h-5 w-5 text-red-500" />
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
                  {answeredQuestions.size} de {totalQuestions} questões respondidas
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
            {/* Question */}
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Questão {currentQuestionIndex + 1} de {totalQuestions}
                </p>
                <h2 className="text-2xl font-semibold text-foreground">
                  {currentQuestion.statement || currentQuestion.name}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelectAnswer(option)}
                    disabled={hasAnsweredCurrent || isSubmitting}
                    className={getAnswerClassName(option)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                          {option}
                        </span>
                        <span className="text-base">
                          {currentQuestion[`answer_${option.toLowerCase()}` as keyof Question] as string}
                        </span>
                      </div>
                      {getAnswerIcon(option)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Submit Button */}
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
                      onClick={handleSkipQuestion}
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
                  'p-4 rounded-lg border-2',
                  answeredQuestions.get(currentQuestion.id)?.isCorrect
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                )}>
                  <p className={cn(
                    'text-center font-medium',
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
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="gap-2 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              {/* Progress dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalQuestions }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={cn(
                      'h-2 rounded-full transition-all cursor-pointer',
                      index === currentQuestionIndex ? 'w-8 bg-primary' : 'w-2',
                      answeredQuestions.has(exercise.questions[index].id)
                        ? 'bg-green-500'
                        : index === currentQuestionIndex
                        ? 'bg-primary'
                        : 'bg-border'
                    )}
                    aria-label={`Ir para questão ${index + 1}`}
                  />
                ))}
              </div>

              {isLastQuestion && allQuestionsAnswered ? (
                <Button
                  onClick={onClose}
                  className="gap-2 cursor-pointer"
                >
                  Finalizar
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="gap-2 cursor-pointer"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
