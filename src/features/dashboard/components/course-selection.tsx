"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { Subscription } from "../hooks/useSubscription"
import { useState } from "react"

interface CourseSelectionProps {
  subscriptions: Subscription[]
  onCourseSelect: (subscription: Subscription) => void
}

export function CourseSelection({ subscriptions, onCourseSelect }: CourseSelectionProps) {
  const [selectedCourse, setSelectedCourse] = useState<Subscription | null>(null)

  const handleConfirm = () => {
    if (selectedCourse) {
      onCourseSelect(selectedCourse)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Bem-vindo!</h1>
          <p className="text-muted-foreground">
            Você está inscrito em múltiplos cursos. Selecione o curso que deseja acessar:
          </p>
        </div>

        <div className="grid gap-4">
          {subscriptions.map((subscription) => (
            <Card
              key={subscription.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCourse?.id === subscription.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
              onClick={() => setSelectedCourse(subscription)}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="relative flex-shrink-0">
                  <Image
                    src={subscription.course_icon}
                    alt={subscription.course_name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  {selectedCourse?.id === subscription.id && (
                    <div className="absolute -right-1 -top-1">
                      <CheckCircle2 className="h-6 w-6 text-primary fill-background" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="text-xl font-semibold">{subscription.course_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Turma: {subscription.student_class_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status: {subscription.status}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={!selectedCourse}
            className="min-w-[200px]"
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
