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
  registrationId?: number
  doubtsCount?: number
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
  registrationId,
  doubtsCount = 0,
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
      shortLabel: 'Comentários',
      icon: MessageCircle,
      count: commentsData?.count || 0,
    },
    {
      value: 'perguntas' as TabValue,
      label: 'Pergunte ao Professor',
      shortLabel: 'Perguntas',
      icon: HelpCircle,
      count: doubtsCount,
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
                'flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-all relative',
                activeTab === tab.value
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
                isDisabled && 'opacity-50 cursor-not-allowed hover:text-muted-foreground'
              )}
              title={isDisabled ? 'Aguarde a operação atual terminar' : undefined}
            >
              <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {tab.count > 0 && (
                <span className={cn(
                  "px-1 sm:px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0",
                  activeTab === tab.value
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              )}
              {isDisabled && tab.value !== activeTab && (
                <Loader2 className="h-3 w-3 animate-spin ml-0.5 sm:ml-1" />
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
          <TeacherQuestions
            lessonId={lessonId}
            registrationId={registrationId}
          />
        )}
      </div>
    </div>
  )
}
