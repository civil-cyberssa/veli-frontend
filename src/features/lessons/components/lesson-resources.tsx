"use client";

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
    <div className="space-y-2">
      {/* Exercício */}
      {hasExercise && (
        <button
          onClick={() => onOpenQuiz?.(exercise.id, exercise.name)}
          className={`w-full text-left rounded-lg border p-4 transition-all hover:shadow-md ${
            isExerciseCompleted
              ? 'border-green-200 bg-green-50/50 hover:bg-green-50 dark:border-green-900 dark:bg-green-950/20 dark:hover:bg-green-950/30'
              : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isExerciseCompleted
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500'
            }`}>
              {isExerciseCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground">
                    {exercise.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {exercise.questions_count} {exercise.questions_count === 1 ? 'questão' : 'questões'}
                  </p>
                </div>
                {isExerciseCompleted && exerciseScore !== null && exerciseScore !== undefined && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-500">
                      {exerciseScore.toFixed(1)}/10
                    </div>
                  </div>
                )}
              </div>

              {!isExerciseCompleted && exercise.answers_count > 0 && (
                <div className="mt-2 space-y-1">
                  <Progress value={exerciseProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    {exercise.answers_count}/{exercise.questions_count} respondidas
                  </p>
                </div>
              )}

              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isExerciseCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : exercise.answers_count > 0
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {isExerciseCompleted ? (
                    <>
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Concluído
                    </>
                  ) : exercise.answers_count > 0 ? (
                    <>
                      <Play className="h-2.5 w-2.5" />
                      Em progresso
                    </>
                  ) : (
                    <>
                      <FileText className="h-2.5 w-2.5" />
                      Não iniciado
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Material de Apoio */}
      {hasMaterial && (
        <button
          onClick={() => window.open(supportMaterialUrl, '_blank')}
          className="w-full text-left rounded-lg border border-amber-200 bg-amber-50/50 p-4 transition-all hover:bg-amber-50 hover:shadow-md dark:border-amber-900 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
              <BookOpen className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-medium text-foreground">
                Material de Apoio
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Material complementar para estudo
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                  <Download className="h-3 w-3" />
                  Baixar material
                </span>
              </div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
