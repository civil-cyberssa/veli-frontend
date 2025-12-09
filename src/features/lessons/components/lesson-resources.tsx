"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, CheckCircle2, Download, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
    <div className="space-y-3">
      {/* Exercício */}
      {hasExercise && (
        <Card className={`overflow-hidden border-0 shadow-md transition-all hover:shadow-lg ${
          isExerciseCompleted
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'
        }`}>
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Ícone */}
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                isExerciseCompleted
                  ? 'bg-green-500/10 ring-1 ring-green-500/20'
                  : 'bg-blue-500/10 ring-1 ring-blue-500/20'
              }`}>
                {isExerciseCompleted ? (
                  <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-500" />
                ) : (
                  <FileText className="h-7 w-7 text-blue-600 dark:text-blue-500" />
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground leading-tight">
                        {exercise.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exercise.questions_count} {exercise.questions_count === 1 ? 'questão' : 'questões'}
                      </p>
                    </div>
                    {isExerciseCompleted && exerciseScore !== null && exerciseScore !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                          {exerciseScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          de acerto
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar (apenas se não concluído) */}
                  {!isExerciseCompleted && exercise.answers_count > 0 && (
                    <div className="space-y-1.5">
                      <Progress value={exerciseProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {exercise.answers_count} de {exercise.questions_count} questões respondidas
                      </p>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      isExerciseCompleted
                        ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                        : exercise.answers_count > 0
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isExerciseCompleted ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Concluído
                        </>
                      ) : exercise.answers_count > 0 ? (
                        <>
                          <Play className="h-3 w-3" />
                          Em progresso
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3" />
                          Não iniciado
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão */}
                <Button
                  onClick={() => onOpenQuiz?.(exercise.id, exercise.name)}
                  className={`w-full ${
                    isExerciseCompleted
                      ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                      : ''
                  }`}
                  size="lg"
                >
                  {isExerciseCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Revisar Exercício
                    </>
                  ) : exercise.answers_count > 0 ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Continuar Exercício
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Exercício
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Material de Apoio */}
      {hasMaterial && (
        <Card className="overflow-hidden border-0 shadow-md transition-all hover:shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Ícone */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
                <BookOpen className="h-7 w-7 text-amber-600 dark:text-amber-500" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground leading-tight">
                    Material de Apoio
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Material complementar para estudo
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => window.open(supportMaterialUrl, '_blank')}
                  className="w-full border-amber-200 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/20"
                  size="lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Material
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
