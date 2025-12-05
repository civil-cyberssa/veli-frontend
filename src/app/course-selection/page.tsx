"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, ArrowRight, LogOut, GraduationCap } from "lucide-react"
import { useSubscriptions, Subscription } from "@/src/features/dashboard/hooks/useSubscription"
import { LogoPulseLoader } from "@/components/shared/logo-loader"

export default function CourseSelectionPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const {
    data: subscriptions,
    loading,
    error,
    setSelectedSubscription,
    markCourseAsSelected,
  } = useSubscriptions()

  const [selectedCourse, setSelectedCourse] = useState<Subscription | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)

  // Verifica autenticação
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    }
  }, [status, router])

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleConfirm = async () => {
    if (selectedCourse) {
      setIsConfirming(true)
      setSelectedSubscription(selectedCourse)
      markCourseAsSelected()
      
      // Animação de transição suave
      await new Promise(resolve => setTimeout(resolve, 400))
      router.push("/home")
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <LogoPulseLoader label="Carregando seus cursos" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Ops! Algo deu errado</h2>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button onClick={() => router.push("/home")} className="w-full sm:w-auto">
            Ir para Home
          </Button>
        </div>
      </div>
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Nenhum curso disponível</h2>
            <p className="text-sm text-muted-foreground">
              Você ainda não possui cursos ativos. Entre em contato com o suporte para mais informações.
            </p>
          </div>
          <Button onClick={() => router.push("/home")} variant="outline" className="w-full sm:w-auto">
            Ir para Home
          </Button>
        </div>
      </div>
    )
  }

  // Auto-seleciona se houver apenas 1 curso
  if (subscriptions.length === 1 && !selectedCourse) {
    setSelectedSubscription(subscriptions[0])
    markCourseAsSelected()
    router.push("/home")
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header com blur */}
      <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/80 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-base">V</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-none">Veli</span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Plataforma de Ensino</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className={`w-full max-w-3xl space-y-10 transition-all duration-700 ease-out ${
            isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
          }`}
        >
          {/* Title Section com gradiente */}
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-2">
              <span className="text-xs font-medium text-primary">Bem-vindo de volta!</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Escolha seu curso
            </h1>
            
            <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              {subscriptions.length === 1 
                ? "Você possui 1 curso ativo. Selecione para continuar."
                : `Você possui ${subscriptions.length} cursos ativos. Selecione um para continuar.`
              }
            </p>
          </div>

          {/* Courses Grid com melhor espaçamento */}
          <div className="space-y-4">
            {subscriptions.map((subscription, index) => {
              const isSelected = selectedCourse?.id === subscription.id

              return (
                <button
                  key={subscription.id}
                  onClick={() => setSelectedCourse(subscription)}
                  disabled={isConfirming}
                  className={`
                    w-full group relative
                    transition-all duration-300 ease-out
                    ${isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}
                    ${isConfirming && !isSelected ? 'opacity-40' : ''}
                  `}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <div
                    className={`
                      relative flex items-center gap-5 p-5 rounded-2xl border-2
                      transition-all duration-300 ease-out
                      ${isSelected
                        ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                        : 'bg-card/50 border-border/60 hover:border-border hover:bg-card hover:shadow-md hover:scale-[1.01]'
                      }
                    `}
                  >
                    {/* Gradient overlay sutil quando selecionado */}
                    {isSelected && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    )}

                    {/* Course Icon melhorado */}
                    <div className="relative flex-shrink-0 z-10">
                      <div className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden
                        transition-all duration-300 ease-out
                        ${isSelected 
                          ? 'ring-4 ring-primary/30 shadow-lg shadow-primary/20' 
                          : 'ring-2 ring-border/50 group-hover:ring-border'
                        }
                      `}>
                        <img
                          src={subscription.course_icon}
                          alt={subscription.course_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Check indicator melhorado */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 animate-in zoom-in-75 duration-300">
                          <div className="w-7 h-7 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center ring-4 ring-background">
                            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Course Info melhorado */}
                    <div className="flex-1 text-left min-w-0 z-10">
                      <h3 className={`
                        font-bold text-lg sm:text-xl mb-1 truncate
                        transition-colors duration-200
                        ${isSelected ? 'text-foreground' : 'text-foreground/90 group-hover:text-foreground'}
                      `}>
                        {subscription.course_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                        {subscription.student_class_name}
                      </p>
                    </div>

                    {/* Status Badge melhorado */}
                    <div className="flex-shrink-0 z-10">
                      {subscription.status === 'active' && (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30 shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Ativo
                        </span>
                      )}
                    </div>

                    {/* Arrow indicator melhorado */}
                    <ArrowRight className={`
                      h-6 w-6 flex-shrink-0 transition-all duration-300 ease-out z-10
                      ${isSelected
                        ? 'text-primary translate-x-0 opacity-100 scale-110'
                        : 'text-muted-foreground/50 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-muted-foreground'
                      }
                    `} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* CTA Button melhorado */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={!selectedCourse || isConfirming}
              className={`
                min-w-[240px] h-12 font-semibold shadow-lg text-base
                transition-all duration-300 ease-out
                ${selectedCourse 
                  ? 'shadow-primary/20 hover:shadow-primary/30 hover:scale-105' 
                  : 'opacity-50'
                }
              `}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Continuar para o curso
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            
            {!selectedCourse && (
              <p className="text-xs text-muted-foreground animate-in fade-in duration-500">
                Selecione um curso acima para continuar
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer melhorado */}
      <footer className="border-t border-border/40 backdrop-blur-sm bg-background/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 Veli. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}