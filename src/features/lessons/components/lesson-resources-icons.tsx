"use client";

import { FileText, BookOpen, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface LessonHeaderProps {
  title: string;
  description: string;
  eventId?: number; // ID do evento da aula (necessário para abrir o quiz)
  exercise?: {
    id: number;
    name: string;
    questions_count: number;
    answers_count: number;
  } | null;
  exerciseScore?: number | null;
  supportMaterialUrl?: string;
  onOpenQuiz?: (eventId: number, exerciseName: string) => void;
}

export function LessonHeader({
  title,
  description,
  eventId,
  exercise,
  exerciseScore,
  supportMaterialUrl,
  onOpenQuiz,
}: LessonHeaderProps) {
  const hasExercise = exercise && exercise.questions_count > 0;
  const isExerciseCompleted = exercise && exercise.answers_count === exercise.questions_count;
  const progressPercentage = exercise
    ? (exercise.answers_count / exercise.questions_count) * 100
    : 0;

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {description}
            </CardDescription>
          </div>
          
          {/* Status Badge */}
          {hasExercise && isExerciseCompleted && (
            <Badge 
              variant="default" 
              className="bg-green-600 hover:bg-green-600 text-white shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Concluído
            </Badge>
          )}
          {hasExercise && !isExerciseCompleted && exercise.answers_count > 0 && (
            <Badge variant="secondary" className="shrink-0">
              Em progresso
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {hasExercise && !isExerciseCompleted && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso do exercício</span>
              <span className="font-medium">
                {exercise.answers_count}/{exercise.questions_count} questões
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Exercise Button */}
          {hasExercise && eventId && (
            <Button
              onClick={() => onOpenQuiz?.(eventId, exercise.name)}
              size="lg"
              className={cn(
                "h-auto py-4 justify-start group relative overflow-hidden",
                isExerciseCompleted
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                {isExerciseCompleted ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">
                    {isExerciseCompleted ? "Revisar Exercício" : "Iniciar Exercício"}
                  </span>
                  <span className="text-xs opacity-90">
                    {isExerciseCompleted
                      ? `Nota: ${exerciseScore}%`
                      : `${exercise.questions_count} ${exercise.questions_count === 1 ? 'questão' : 'questões'}`}
                  </span>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          )}

          {/* Material Button */}
          {supportMaterialUrl && (
            <Button
              onClick={() => window.open(supportMaterialUrl, "_blank")}
              variant="outline"
              size="lg"
              className="h-auto py-4 justify-start group border-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                  <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                </div>
                
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground">
                    Material de Apoio
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    Abrir em nova aba
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
