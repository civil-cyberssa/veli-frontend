"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, GraduationCap } from "lucide-react"
import { useSubscriptions, Subscription } from "@/src/features/dashboard/hooks/useSubscription"

export default function CourseSelectionPage() {
  const router = useRouter()
  const {
    data: subscriptions,
    loading,
    error,
    setSelectedSubscription,
    markCourseAsSelected,
  } = useSubscriptions()

  const [selectedCourse, setSelectedCourse] = useState<Subscription | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleConfirm = () => {
    if (selectedCourse) {
      setSelectedSubscription(selectedCourse)
      markCourseAsSelected()

      // Animação de saída antes de redirecionar
      setIsAnimating(true)
      setTimeout(() => {
        router.push("/home")
      }, 400)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando seus cursos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive">Erro ao carregar cursos: {error.message}</p>
          <Button onClick={() => router.push("/home")}>
            Ir para Home
          </Button>
        </div>
      </div>
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Nenhum curso encontrado</p>
          <Button onClick={() => router.push("/home")}>
            Ir para Home
          </Button>
        </div>
      </div>
    )
  }

  // Se houver apenas 1 curso, seleciona automaticamente e redireciona
  if (subscriptions.length === 1) {
    setSelectedSubscription(subscriptions[0])
    markCourseAsSelected()
    router.push("/home")
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div
        className={`w-full max-w-3xl space-y-8 transition-all duration-500 ${
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Header com animação */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Bem-vindo!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Você está inscrito em múltiplos cursos. Selecione o curso que deseja acessar:
          </p>
        </div>

        {/* Grid de cursos com animação escalonada */}
        <div className="grid gap-4">
          {subscriptions.map((subscription, index) => (
            <Card
              key={subscription.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                selectedCourse?.id === subscription.id
                  ? "border-primary ring-2 ring-primary/30 shadow-md"
                  : "border-border hover:border-primary/50"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating ? "translateX(-20px)" : "translateX(0)"
              }}
              onClick={() => setSelectedCourse(subscription)}
            >
              <CardContent className="flex items-center gap-6 p-6">
                {/* Ícone do curso */}
                <div className="relative flex-shrink-0">
                  <div className={`w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 ${
                    selectedCourse?.id === subscription.id ? "ring-4 ring-primary/20" : ""
                  }`}>
                    <img
                      src={subscription.course_icon}
                      alt={subscription.course_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedCourse?.id === subscription.id && (
                    <div className="absolute -right-2 -top-2 animate-in zoom-in-50">
                      <CheckCircle2 className="h-8 w-8 text-primary fill-background drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Informações do curso */}
                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold">{subscription.course_name}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Turma:</span> {subscription.student_class_name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {subscription.status === 'active' ? 'Ativo' : subscription.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicador visual de seleção */}
                <div className={`w-1 h-16 rounded-full transition-all duration-300 ${
                  selectedCourse?.id === subscription.id
                    ? "bg-primary"
                    : "bg-transparent"
                }`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botão de continuar */}
        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={!selectedCourse}
            className="min-w-[240px] h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedCourse ? (
              <>
                Continuar com {selectedCourse.course_name}
                <CheckCircle2 className="ml-2 h-5 w-5" />
              </>
            ) : (
              "Selecione um curso"
            )}
          </Button>
        </div>

        {/* Link para voltar (opcional) */}
        <div className="text-center pt-2">
          <button
            onClick={() => router.push("/auth")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Fazer logout
          </button>
        </div>
      </div>
    </div>
  )
}
