"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, GraduationCap } from "lucide-react"
import { useSubscription } from "../hooks/use-subscription"
import { toast } from "sonner"

export default function CourseSelection() {
  const router = useRouter()
  const { subscriptions, loading, error } = useSubscription()

  useEffect(() => {
    if (!loading && subscriptions) {
      // Se tiver apenas 1 curso, redireciona automaticamente
      if (subscriptions.length === 1) {
        const courseId = subscriptions[0].course.id
        localStorage.setItem("selectedCourseId", courseId.toString())
        toast.success("Curso selecionado automaticamente", {
          description: `${subscriptions[0].course.name}`,
          position: "top-center",
          duration: 2000,
        })
        setTimeout(() => {
          router.replace("/home")
        }, 1000)
      }
    }
  }, [loading, subscriptions, router])

  const handleCourseSelect = (courseId: number, courseName: string) => {
    localStorage.setItem("selectedCourseId", courseId.toString())
    toast.success("Curso selecionado", {
      description: courseName,
      position: "top-center",
      duration: 2000,
    })
    setTimeout(() => {
      router.replace("/home")
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando seus cursos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-500">Erro ao carregar cursos</CardTitle>
            <CardDescription>
              Não foi possível carregar suas matrículas. Por favor, tente novamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Nenhum curso encontrado</CardTitle>
            <CardDescription>
              Você ainda não está matriculado em nenhum curso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.replace("/auth")}
              className="w-full"
            >
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se tiver 1 curso, mostra loading (porque o useEffect vai redirecionar)
  if (subscriptions.length === 1) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando curso...</p>
        </div>
      </div>
    )
  }

  // Se tiver 2 ou mais cursos, mostra a tela de seleção
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <GraduationCap className="w-16 h-16 mx-auto text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Selecione seu curso
          </h1>
          <p className="text-muted-foreground">
            Você está matriculado em {subscriptions.length} cursos. Escolha qual deseja acessar.
          </p>
        </div>

        {/* Grid de cursos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {subscriptions.map((subscription) => (
            <Card
              key={subscription.id}
              className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50"
              onClick={() => handleCourseSelect(subscription.course.id, subscription.course.name)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <BookOpen className="w-10 h-10 text-primary" />
                  <Badge variant={subscription.is_active ? "default" : "secondary"}>
                    {subscription.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardTitle className="text-xl sm:text-2xl mt-4">
                  {subscription.course.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {subscription.course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {subscription.course.language}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Nível {subscription.course.level}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Matriculado em:{" "}
                  {new Date(subscription.enrollment_date).toLocaleDateString("pt-BR")}
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleCourseSelect(subscription.course.id, subscription.course.name)}
                >
                  Acessar curso
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
