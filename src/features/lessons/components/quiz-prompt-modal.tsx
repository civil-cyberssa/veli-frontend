"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileText, Clock } from "lucide-react";

interface QuizPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  questionsCount: number;
  onStartNow: () => void;
  onLater: () => void;
}

export function QuizPromptModal({
  open,
  onOpenChange,
  exerciseName,
  questionsCount,
  onStartNow,
  onLater,
}: QuizPromptModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Parabéns por concluir a aula!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p className="text-base">
              Que tal testar seus conhecimentos agora?
            </p>
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="font-semibold text-foreground">
                {exerciseName}
              </p>
              <p className="text-sm text-muted-foreground">
                {questionsCount} {questionsCount === 1 ? 'questão' : 'questões'}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
          <AlertDialogAction
            onClick={onStartNow}
            className="w-full order-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Começar agora
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onLater}
            className="w-full order-2 m-0"
          >
            <Clock className="h-4 w-4 mr-2" />
            Fazer depois
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
