"use client"

import { useParams } from "next/navigation"
import LessonDetail from "@/src/features/lessons/lesson-detail"

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id as string

  return <LessonDetail lessonId={lessonId} />
}
