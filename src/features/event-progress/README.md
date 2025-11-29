# Event Progress Feature

Feature completa para visualização do progresso de eventos, incluindo módulos, aulas e exercícios.

## 📁 Estrutura

```
src/features/event-progress/
├── components/
│   ├── LessonItem.tsx          # Componente de item de aula
│   ├── ModuleCard.tsx          # Componente de card de módulo
│   ├── ProgressSidebar.tsx     # Sidebar com progresso geral
│   └── index.ts                # Exportações dos componentes
├── hooks/
│   ├── useEventProgress.tsx    # Hook para buscar e processar dados
│   └── index.ts                # Exportações dos hooks
├── types/
│   └── index.ts                # Tipos TypeScript
├── index.ts                    # Exportação geral da feature
└── README.md                   # Esta documentação
```

## 🚀 Uso

### Hook useEventProgress

```tsx
import { useEventProgress } from '@/features/event-progress'

function MyComponent() {
  const { data, isLoading, error, refetch } = useEventProgress(eventId)

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState />
  if (!data) return <EmptyState />

  return <EventProgressView data={data} />
}
```

### Tipos principais

#### LessonProgress
```typescript
interface LessonProgress {
  event_id: number
  lesson_id: number
  lesson_name: string
  module_id: number
  module_name: string
  scheduled_datetime: string
  watched: boolean
  watched_at: string | null
  rating: number | null
  comment: string
  exercise: Exercise | null
  exercise_score: number | null
}
```

#### ModuleProgress
```typescript
interface ModuleProgress {
  moduleId: number
  moduleName: string
  lessons: LessonProgress[]
  completedCount: number
  totalCount: number
  progressPercentage: number
}
```

#### EventProgressData
```typescript
interface EventProgressData {
  modules: ModuleProgress[]
  totalLessons: number
  completedLessons: number
  overallProgress: number
}
```

## 🎨 Componentes

### ModuleCard
Renderiza um módulo completo com todas as suas aulas.

**Props:**
- `module: ModuleProgress` - Dados do módulo
- `index: number` - Índice para animações

### LessonItem
Renderiza uma aula individual com seus detalhes.

**Props:**
- `lesson: LessonProgress` - Dados da aula
- `index: number` - Índice para animações

**Features:**
- Status visual (assistida/pendente)
- Data formatada (dd/MM/yyyy - HH:mm)
- Avaliação com estrelas
- Botão para exercício (quando disponível)
- Indicador de pontuação do exercício

### ProgressSidebar
Sidebar com resumo do progresso geral.

**Props:**
- `data: EventProgressData` - Dados completos do evento

**Features:**
- Progresso circular animado
- Estatísticas de aulas e módulos
- Lista de módulos com barras de progresso
- Card de conquista (quando 100% completo)
- Cards de estatísticas rápidas

## 📄 Página

A página está localizada em:
```
src/app/(private)/event-progress/[id]/page.tsx
```

**Rota:** `/event-progress/[id]`

**Features da página:**
- Layout responsivo (sidebar lateral no desktop)
- Loading skeleton moderno
- Estados de erro e vazio
- Animações com Framer Motion
- Design clean inspirado em Rocketseat

## 🎨 Design System

### Cores
- **Primary:** Purple (600-700)
- **Success:** Green (500-800)
- **Warning:** Yellow/Orange (400-500)
- **Neutral:** Gray (50-900)

### Espacamentos
- Cards: `p-4`, `p-6`
- Gaps: `gap-3`, `gap-4`, `gap-8`
- Margens: `mb-4`, `mb-6`, `mb-8`

### Border Radius
- Cards principais: `rounded-2xl`
- Elementos menores: `rounded-xl`, `rounded-full`

### Animações
- Fade in: `opacity` com `framer-motion`
- Slide in: `y` offset com delay progressivo
- Progress bars: largura animada com delay

## 🔧 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem forte
- **TailwindCSS** - Estilização
- **SWR** - Data fetching e cache
- **Framer Motion** - Animações
- **date-fns** - Formatação de datas
- **Lucide React** - Ícones

## 📱 Responsividade

- **Mobile:** Layout em coluna, sidebar abaixo do conteúdo
- **Desktop:** Layout em duas colunas, sidebar fixa à direita
- **Breakpoint:** `lg` (1024px)

## ✨ Features Especiais

1. **Agrupamento inteligente** - Aulas agrupadas por módulo automaticamente
2. **Cálculo de progresso** - Porcentagens calculadas para módulos e geral
3. **Cache com SWR** - Revalidação inteligente (30s de deduplicação)
4. **Loading skeleton** - Experiência visual durante carregamento
5. **Animações suaves** - Transições e delays progressivos
6. **Card de conquista** - Aparece ao completar 100%
7. **Indicadores visuais** - Status, avaliações, exercícios

## 🔒 Autenticação

O hook automaticamente:
- Verifica se o usuário está autenticado
- Adiciona token Bearer no header
- Retorna `undefined` se não autenticado

## 🌐 API Endpoint

```
GET /student-portal/event-progress/{eventId}/
```

**Response:** Array de `LessonProgress[]`

## 📝 Exemplo Completo

```tsx
'use client'

import { useParams } from 'next/navigation'
import { useEventProgress, ModuleCard, ProgressSidebar } from '@/features/event-progress'

export default function EventProgressPage() {
  const params = useParams()
  const eventId = params?.id ? parseInt(params.id as string) : null
  const { data, isLoading, error } = useEventProgress(eventId)

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />
  if (!data) return <EmptyState />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {data.modules.map((module, index) => (
            <ModuleCard key={module.moduleId} module={module} index={index} />
          ))}
        </div>
        <div className="w-80">
          <ProgressSidebar data={data} />
        </div>
      </div>
    </div>
  )
}
```

---

**Desenvolvido seguindo padrões de Clean Code e design moderno** 🚀
