'use client'

import { useState } from 'react'
import { MessageCircle, HelpCircle } from 'lucide-react'
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
      count: 0, // Será preenchido quando integrar com API
    },
  ]

  return (
    <div className="space-y-0">
      {/* Tabs */}
      <div className="flex border-b border-border/50">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all relative',
              activeTab === tab.value
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
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
            {activeTab === tab.value && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
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
          />
        )}

        {activeTab === 'perguntas' && (
          <TeacherQuestions lessonId={lessonId} />
        )}
      </div>
    </div>
  )
}
