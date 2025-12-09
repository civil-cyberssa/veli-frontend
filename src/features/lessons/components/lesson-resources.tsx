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
          {/* Exercício - Destaque no topo */}
          {hasExercise && (
            <div className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
              isExerciseCompleted
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-primary/30 bg-primary/5 shadow-sm'
            }`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                isExerciseCompleted
                  ? 'bg-green-500/20 ring-2 ring-green-500/30'
                  : 'bg-primary/20 ring-2 ring-primary/30'
              }`}>
                {isExerciseCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <FileText className="h-6 w-6 text-primary" />
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {exercise.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                    <span className="font-medium">{exercise.questions_count} questões</span>
                    <span>•</span>
                    <span>
                      {isExerciseCompleted ? (
                        <>
                          <span className="text-green-600 font-medium">Concluído</span>
                          {exerciseScore !== null && exerciseScore !== undefined && (
                            <> • <span className="font-medium">{exerciseScore}% de acerto</span></>
                          )}
                        </>
                      ) : (
                        <>
                          {exercise.answers_count > 0
                            ? <span className="text-primary font-medium">{exerciseProgress}% concluído ({exercise.answers_count}/{exercise.questions_count})</span>
                            : <span className="font-medium">Não iniciado</span>}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  variant={isExerciseCompleted ? "outline" : "default"}
                  size="default"
                  className="w-full"
                  onClick={() => onOpenQuiz?.(exercise.id, exercise.name)}
                >
                  {isExerciseCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Revisar Exercício
                    </>
                  ) : exercise.answers_count > 0 ? (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Continuar Exercício
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Iniciar Exercício
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

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
        </div>
      </div>
    </Card>
  );
}
