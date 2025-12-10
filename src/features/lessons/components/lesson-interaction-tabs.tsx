'use client'

import { useState, useCallback } from 'react'
import { MessageCircle, HelpCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LessonCommentsList } from './lesson-comments-list'
import { TeacherQuestions } from './teacher-questions'
import type { LessonCommentsResponse } from '@/src/features/dashboard/hooks/useLessonComments'

interface LessonInteractionTabsProps {
  // Props para comentários
  commentsData: LessonCommentsResponse | null
  isLoadingComments?: boolean
  onSubmitComment: (comment: string) => Promise<void>
  onEditComment?: (commentId: number, newComment: string) => Promise<void>
  onDeleteComment?: (commentId: number) => Promise<void>
  isSubmittingComment?: boolean

  // Props para perguntas ao professor
  lessonId: number
}

type TabValue = 'comentarios' | 'perguntas'

export function LessonInteractionTabs({
  commentsData,
  isLoadingComments,
  onSubmitComment,
  onEditComment,
  onDeleteComment,
  isSubmittingComment,
  lessonId,
}: LessonInteractionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('comentarios')
  const [isCommentOperating, setIsCommentOperating] = useState(false)

  const handleOperationStateChange = useCallback((isOperating: boolean) => {
    setIsCommentOperating(isOperating)
  }, [])

  const handleTabChange = (tabValue: TabValue) => {
    if (isCommentOperating) {
      // Não permitir troca de aba se houver operação em andamento
      return
    }
    setActiveTab(tabValue)
  }

  const tabs = [
    {
      value: 'comentarios' as TabValue,
      label: 'Comentários',
      icon: MessageCircle,
      count: commentsData?.count || 0,
    },
    {
      value: 'perguntas' as TabValue,
      label: 'Pergunte ao Professor',
      icon: HelpCircle,
      count: 3, // Dados mockados - em produção virá da API
    },
  ]

  return (
    <div className="space-y-0">
      {/* Tabs */}
      <div className="flex border-b border-border/50" data-tour="interaction-tabs">
        {tabs.map((tab) => {
          const isDisabled = isCommentOperating && tab.value !== activeTab
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              disabled={isDisabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all relative',
                activeTab === tab.value
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
                isDisabled && 'opacity-50 cursor-not-allowed hover:text-muted-foreground'
              )}
              title={isDisabled ? 'Aguarde a operação atual terminar' : undefined}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs font-medium",
                  activeTab === tab.value
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              )}
              {isDisabled && tab.value !== activeTab && (
                <Loader2 className="h-3 w-3 animate-spin ml-1" />
              )}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Conteúdo das tabs */}
      <div>
        {activeTab === 'comentarios' && (
          <LessonCommentsList
            commentsData={commentsData}
            isLoading={isLoadingComments}
            onSubmitComment={onSubmitComment}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            isSubmitting={isSubmittingComment}
            onOperationStateChange={handleOperationStateChange}
          />
        )}

        {activeTab === 'perguntas' && (
          <TeacherQuestions lessonId={lessonId} />
        )}
      </div>
    </div>
  )
}
