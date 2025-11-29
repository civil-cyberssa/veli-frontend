"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, ArrowRight, LogOut } from "lucide-react"
import { useSubscriptions, Subscription } from "@/src/features/dashboard/hooks/useSubscription"

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

  const handleConfirm = () => {
    if (selectedCourse) {
      setSelectedSubscription(selectedCourse)
      markCourseAsSelected()
      setIsAnimating(true)
      setTimeout(() => router.push("/home"), 300)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-sm text-destructive">{error.message}</p>
          <Button onClick={() => router.push("/home")} variant="outline">
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
          <p className="text-sm text-muted-foreground">Nenhum curso encontrado</p>
          <Button onClick={() => router.push("/home")} variant="outline">
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-sm">Veli</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className={`w-full max-w-2xl space-y-8 transition-all duration-500 ease-out ${
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {/* Title Section */}
          <div className="space-y-3 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Escolha seu curso
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              Selecione o curso que deseja acessar para continuar
            </p>
          </div>

          {/* Courses Grid */}
          <div className="space-y-3">
            {subscriptions.map((subscription, index) => {
              const isSelected = selectedCourse?.id === subscription.id

              return (
                <button
                  key={subscription.id}
                  onClick={() => setSelectedCourse(subscription)}
                  className={`
                    w-full group relative
                    transition-all duration-200 ease-out
                    ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
                  `}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`
                      relative flex items-center gap-4 p-4 rounded-xl border
                      transition-all duration-200
                      ${isSelected
                        ? 'bg-primary/5 border-primary shadow-sm'
                        : 'bg-card border-border/50 hover:border-border hover:bg-muted/30'
                      }
                    `}
                  >
                    {/* Course Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`
                        w-14 h-14 rounded-lg overflow-hidden ring-offset-2
                        transition-all duration-200
                        ${isSelected ? 'ring-2 ring-primary' : 'ring-0'}
                      `}>
                        <img
                          src={subscription.course_icon}
                          alt={subscription.course_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Check indicator */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 animate-in zoom-in-50 duration-200">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 text-left min-w-0">
                      <h3 className={`
                        font-semibold text-base sm:text-lg truncate
                        transition-colors duration-200
                        ${isSelected ? 'text-foreground' : 'text-foreground/90'}
                      `}>
                        {subscription.course_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {subscription.student_class_name}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {subscription.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Ativo
                        </span>
                      )}
                    </div>

                    {/* Arrow indicator */}
                    <ArrowRight className={`
                      h-5 w-5 flex-shrink-0 transition-all duration-200
                      ${isSelected
                        ? 'text-primary translate-x-0 opacity-100'
                        : 'text-muted-foreground -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                      }
                    `} />
                  </div>
                </button>
              )
            })}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={!selectedCourse}
              className="min-w-[200px] h-11 font-medium shadow-sm"
            >
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Veli. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
