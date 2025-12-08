"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, CheckCircle2, Circle, Download } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  questions_count: number;
  answers_count: number;
}

interface LessonResourcesProps {
  exercise?: Exercise | null;
  exerciseScore?: number | null;
  supportMaterialUrl?: string;
  onOpenQuiz?: (exerciseId: number, exerciseName: string) => void;
}

export function LessonResources({
  exercise,
  exerciseScore,
  supportMaterialUrl,
  onOpenQuiz,
}: LessonResourcesProps) {
  const hasExercise = exercise && exercise.questions_count > 0;
  const hasMaterial = supportMaterialUrl;

  // Se não houver exercício nem material, não renderizar nada
  if (!hasExercise && !hasMaterial) {
    return null;
  }

  const isExerciseCompleted = exercise && exercise.answers_count === exercise.questions_count;
  const exerciseProgress = exercise
    ? Math.round((exercise.answers_count / exercise.questions_count) * 100)
    : 0;

  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Recursos da Aula
        </h3>

        <div className="space-y-3">
          {/* Material de Apoio */}
          {hasMaterial && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Material de Apoio
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Material complementar para estudo
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => window.open(supportMaterialUrl, '_blank')}
                >
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Baixar Material
                </Button>
              </div>
            </div>
          )}

          {/* Exercício */}
          {hasExercise && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isExerciseCompleted
                  ? 'bg-green-500/10'
                  : 'bg-orange-500/10'
              }`}>
                {isExerciseCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <FileText className="h-5 w-5 text-orange-600" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {exercise.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{exercise.questions_count} questões</span>
                    <span>•</span>
                    <span>
                      {isExerciseCompleted ? (
                        <>
                          Concluído
                          {exerciseScore !== null && exerciseScore !== undefined && (
                            <> • {exerciseScore}% de acerto</>
                          )}
                        </>
                      ) : (
                        <>
                          {exercise.answers_count > 0
                            ? `${exerciseProgress}% concluído (${exercise.answers_count}/${exercise.questions_count})`
                            : 'Não iniciado'}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  variant={isExerciseCompleted ? "outline" : "default"}
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => onOpenQuiz?.(exercise.id, exercise.name)}
                >
                  {isExerciseCompleted ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                      Revisar Exercício
                    </>
                  ) : exercise.answers_count > 0 ? (
                    <>
                      <Circle className="h-3.5 w-3.5 mr-2" />
                      Continuar Exercício
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 mr-2" />
                      Iniciar Exercício
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
