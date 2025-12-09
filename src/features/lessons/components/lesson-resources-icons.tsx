"use client";

import { FileText, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: number;
  name: string;
  questions_count: number;
  answers_count: number;
}

interface LessonResourcesIconsProps {
  exercise?: Exercise | null;
  exerciseScore?: number | null;
  supportMaterialUrl?: string;
  onOpenQuiz?: (exerciseId: number, exerciseName: string) => void;
}

export function LessonResourcesIcons({
  exercise,
  exerciseScore,
  supportMaterialUrl,
  onOpenQuiz,
}: LessonResourcesIconsProps) {
  const hasExercise = exercise && exercise.questions_count > 0;
  const hasMaterial = supportMaterialUrl;

  if (!hasExercise && !hasMaterial) {
    return null;
  }

  const isExerciseCompleted = exercise && exercise.answers_count === exercise.questions_count;

  return (
    <div className="grid grid-cols-1 gap-2">
      {/* Quiz Icon */}
      {hasExercise && (
        <button
          onClick={() => onOpenQuiz?.(exercise.id, exercise.name)}
          className={cn(
            "flex items-center justify-center p-4 rounded-lg border transition-all hover:scale-105",
            isExerciseCompleted
              ? "border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/30"
              : "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30"
          )}
          title={`${exercise.name} - ${exercise.questions_count} questões`}
        >
          <div className="relative">
            {isExerciseCompleted ? (
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
            ) : (
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            )}
            {isExerciseCompleted && exerciseScore !== null && exerciseScore !== undefined && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[8px] font-bold text-white">
                {exerciseScore}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Material Icon */}
      {hasMaterial && (
        <button
          onClick={() => window.open(supportMaterialUrl, '_blank')}
          className="flex items-center justify-center p-4 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 hover:scale-105 transition-all dark:border-amber-800 dark:bg-amber-950/30"
          title="Material de Apoio"
        >
          <BookOpen className="h-8 w-8 text-amber-600 dark:text-amber-500" />
        </button>
      )}
    </div>
  );
}
