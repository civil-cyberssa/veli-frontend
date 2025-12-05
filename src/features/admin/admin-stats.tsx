"use client"

import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="border-border/60 hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}>
            <TrendingUp className={`h-3 w-3 ${!trend.isPositive && "rotate-180"}`} />
            {trend.isPositive ? "+" : ""}{trend.value}% este mês
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminStats() {
  // Dados de exemplo - podem ser substituídos por dados reais da API
  const stats = [
    {
      title: "Total de Alunos",
      value: "1,234",
      description: "Alunos ativos na plataforma",
      icon: <Users className="h-4 w-4" />,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Cursos Ativos",
      value: "48",
      description: "Cursos disponíveis",
      icon: <BookOpen className="h-4 w-4" />,
      trend: { value: 3, isPositive: true },
    },
    {
      title: "Taxa de Conclusão",
      value: "87%",
      description: "Média de conclusão dos cursos",
      icon: <GraduationCap className="h-4 w-4" />,
      trend: { value: 5, isPositive: true },
    },
    {
      title: "Engajamento",
      value: "92%",
      description: "Alunos ativos nos últimos 7 dias",
      icon: <TrendingUp className="h-4 w-4" />,
      trend: { value: 8, isPositive: true },
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
