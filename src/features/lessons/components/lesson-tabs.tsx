"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Download,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  User
} from "lucide-react"

// Mock data
const mockMaterials = [
  { id: "1", name: "Slides da aula", type: "PDF", size: "2.5 MB", url: "#" },
  { id: "2", name: "Código fonte", type: "ZIP", size: "156 KB", url: "#" },
  { id: "3", name: "Documentação adicional", type: "PDF", size: "1.8 MB", url: "#" },
]

const mockComments = [
  {
    id: "1",
    author: "João Silva",
    avatar: "JS",
    date: "2 dias atrás",
    content: "Excelente aula! Consegui entender todos os conceitos apresentados. Muito obrigado!",
    likes: 5
  },
  {
    id: "2",
    author: "Maria Santos",
    avatar: "MS",
    date: "5 dias atrás",
    content: "Alguém poderia me ajudar com a parte de async/await? Não consegui implementar corretamente.",
    likes: 2
  },
  {
    id: "3",
    author: "Pedro Costa",
    avatar: "PC",
    date: "1 semana atrás",
    content: "Material muito bem organizado. Os exemplos práticos ajudaram bastante!",
    likes: 8
  },
]

const mockActivities = [
  {
    id: "1",
    title: "Quiz - Fundamentos",
    description: "Teste seus conhecimentos sobre os conceitos básicos",
    questions: 10,
    duration: "15 min",
    completed: true
  },
  {
    id: "2",
    title: "Desafio prático",
    description: "Implemente uma aplicação usando os conceitos aprendidos",
    questions: 1,
    duration: "60 min",
    completed: false
  },
  {
    id: "3",
    title: "Exercício de fixação",
    description: "Resolva os problemas propostos para fixar o conteúdo",
    questions: 5,
    duration: "30 min",
    completed: false
  },
]

export default function LessonTabs() {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="info">Informações</TabsTrigger>
        <TabsTrigger value="materials">Materiais</TabsTrigger>
        <TabsTrigger value="comments">Comentários</TabsTrigger>
        <TabsTrigger value="activities">Atividades</TabsTrigger>
      </TabsList>

      {/* Informações */}
      <TabsContent value="info" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sobre esta aula</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nesta aula, você vai aprender os conceitos fundamentais da programação,
              incluindo variáveis, tipos de dados, estruturas de controle e funções.
              Vamos explorar exemplos práticos e aplicações reais desses conceitos.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duração</p>
                  <p className="text-xs text-muted-foreground">20 minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Materiais</p>
                  <p className="text-xs text-muted-foreground">3 arquivos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Atividades</p>
                  <p className="text-xs text-muted-foreground">3 exercícios</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>O que você vai aprender</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-sm">Entender os conceitos básicos de programação</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-sm">Trabalhar com variáveis e tipos de dados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-sm">Implementar estruturas de controle</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-sm">Criar e utilizar funções</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Materiais */}
      <TabsContent value="materials" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Materiais disponíveis</CardTitle>
            <CardDescription>
              Baixe os materiais complementares desta aula
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{material.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {material.type} • {material.size}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Comentários */}
      <TabsContent value="comments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Comentários</CardTitle>
            <CardDescription>
              Participe da discussão sobre esta aula
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockComments.map((comment) => (
                <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">{comment.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{comment.author}</p>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {comment.content}
                    </p>
                    <Button variant="ghost" size="sm" className="h-7">
                      👍 {comment.likes}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <textarea
                placeholder="Adicione um comentário..."
                className="w-full min-h-20 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm">Comentar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Atividades */}
      <TabsContent value="activities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Atividades</CardTitle>
            <CardDescription>
              Complete as atividades para fixar o conteúdo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        {activity.completed && (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Concluído
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{activity.questions} {activity.questions === 1 ? 'questão' : 'questões'}</span>
                        <span>•</span>
                        <span>{activity.duration}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-3"
                    variant={activity.completed ? "outline" : "default"}
                  >
                    {activity.completed ? "Revisar" : "Iniciar"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
