"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ScrollText,
} from "lucide-react";
import { useExercise } from "@/src/features/dashboard/hooks/useExercise";
import {
  useLessonDoubts,
  useCreateDoubt,
} from "@/src/features/lessons/hooks/useLessonDoubts";

interface ClassDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  lessonId?: number;
  registrationId?: number;
  className?: string;
}

export function ClassDetailsModal({
  open,
  onOpenChange,
  eventId,
  lessonId,
  registrationId,
  className,
}: ClassDetailsModalProps) {
  const [doubtComment, setDoubtComment] = useState("");
  const { data: exercise, isLoading: loadingExercise } = useExercise(eventId);
  const { data: doubts, isLoading: loadingDoubts } = useLessonDoubts(
    registrationId,
    lessonId
  );
  const { mutateAsync: createDoubt, isPending: creatingDoubt } =
    useCreateDoubt();

  const handleSubmitDoubt = async () => {
    if (!doubtComment.trim() || !registrationId || !lessonId) return;

    try {
      await createDoubt({
        registration: registrationId,
        lesson: lessonId,
        comment: doubtComment.trim(),
      });
      setDoubtComment("");
    } catch (error) {
      console.error("Erro ao enviar dúvida:", error);
    }
  };

  // Mock de transcrição - substituir quando API estiver disponível
  const mockTranscript = `Esta é uma transcrição de exemplo da aula.

Ainda não temos a API de transcrição implementada, mas aqui você verá o conteúdo completo da aula em texto.

A transcrição permitirá que você:
• Revise o conteúdo da aula de forma textual
• Copie trechos importantes
• Busque por palavras-chave específicas
• Acompanhe enquanto assiste a gravação

Em breve esta funcionalidade estará disponível com o conteúdo real da aula.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {className || "Detalhes da Aula"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="exercise" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 h-auto py-0">
            <TabsTrigger
              value="exercise"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 py-3"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exercícios
            </TabsTrigger>
            <TabsTrigger
              value="transcript"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 py-3"
            >
              <ScrollText className="h-4 w-4 mr-2" />
              Transcrição
            </TabsTrigger>
            <TabsTrigger
              value="doubts"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-4 py-3"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Dúvidas
              {doubts && doubts.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {doubts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="exercise" className="mt-0 p-6">
              {loadingExercise ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : exercise ? (
                <div className="space-y-4">
                  <Card className="p-4 border-primary/20 bg-primary/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">
                          {exercise.exercise.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {exercise.exercise.questions_count} questões
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge
                            variant={
                              exercise.answers_count ===
                              exercise.exercise.questions_count
                                ? "default"
                                : "secondary"
                            }
                            className="gap-1"
                          >
                            {exercise.answers_count ===
                            exercise.exercise.questions_count ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                Completo
                              </>
                            ) : (
                              <>
                                {exercise.answers_count}/
                                {exercise.exercise.questions_count} respondidas
                              </>
                            )}
                          </Badge>
                          {exercise.score > 0 && (
                            <span className="text-sm font-semibold text-primary">
                              Nota: {exercise.score.toFixed(1)}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {exercise.questions && exercise.questions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Questões</h4>
                      {exercise.questions.map((question, idx) => {
                        const answer = exercise.answers.find(
                          (a) => a.question_id === question.id
                        );
                        return (
                          <Card key={question.id} className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <Badge variant="outline" className="shrink-0">
                                  {idx + 1}
                                </Badge>
                                <p className="text-sm font-medium leading-relaxed">
                                  {question.statement}
                                </p>
                              </div>
                              {answer && (
                                <div className="ml-9 flex items-center gap-2 text-xs">
                                  {answer.is_correct ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                  ) : (
                                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                                  )}
                                  <span
                                    className={
                                      answer.is_correct
                                        ? "text-success"
                                        : "text-destructive"
                                    }
                                  >
                                    Sua resposta: {answer.answer}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum exercício disponível para esta aula
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="transcript" className="mt-0 p-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Transcrição da Aula</h3>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {mockTranscript}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="doubts" className="mt-0 p-6">
              <div className="space-y-4">
                {/* Form para nova dúvida */}
                {registrationId && lessonId && (
                  <Card className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Postar nova dúvida
                      </h4>
                      <Textarea
                        placeholder="Digite sua dúvida sobre a aula..."
                        value={doubtComment}
                        onChange={(e) => setDoubtComment(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                      <Button
                        onClick={handleSubmitDoubt}
                        disabled={!doubtComment.trim() || creatingDoubt}
                        className="w-full gap-2"
                      >
                        {creatingDoubt ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Enviar dúvida
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Lista de dúvidas */}
                {loadingDoubts ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : doubts && doubts.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Dúvidas anteriores</h4>
                    {doubts.map((doubt) => (
                      <Card key={doubt.id} className="p-4">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm leading-relaxed">
                              {doubt.comment}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(doubt.created_at).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                          {doubt.doubt_answers &&
                            doubt.doubt_answers.length > 0 && (
                              <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                                {doubt.doubt_answers.map((answer) => (
                                  <div
                                    key={answer.id}
                                    className="p-3 rounded-lg bg-primary/5"
                                  >
                                    <p className="text-sm font-medium text-primary mb-1">
                                      {answer.teacher_name}
                                    </p>
                                    <p className="text-sm leading-relaxed">
                                      {answer.comment}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {new Date(answer.created_at).toLocaleDateString(
                                        "pt-BR",
                                        {
                                          day: "2-digit",
                                          month: "short",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma dúvida postada ainda
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
