"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"

type CourseGreetingProps = {
  courseName?: string | null
}

const TYPE_SPEED = 85
const DELETE_SPEED = 40
const HOLD_DELAY = 1700

export function CourseGreeting({ courseName }: CourseGreetingProps) {
  const { data: session } = useSession()
  const [displayText, setDisplayText] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const firstName = useMemo(() => {
    const fullName = session?.student_full_name?.trim()
    if (!fullName) return "User"
    return fullName.split(/\s+/)[0]
  }, [session?.student_full_name])

  const isFrenchCourse = useMemo(() => /franc[eê]s/i.test(courseName ?? ""), [courseName])
  const isEnglishCourse = useMemo(() => /ingl[eê]s/i.test(courseName ?? ""), [courseName])

  const frenchPhrases = useMemo(
    () => [
      `Salut, ${firstName}.`,
      `Bonjour, ${firstName}.`,
      `Bienvenue, ${firstName}.`,
      `Salut, ${firstName}, on y va ?`,
    ],
    [firstName]
  )

  const englishPhrases = useMemo(
    () => [
      `Welcome, ${firstName}, enjoy the experience.`,
      `Hey, ${firstName}, let’s build something.`,
      `Hello, ${firstName}, welcome back.`,
      `Hi, ${firstName}`,
    ],
    [firstName]
  )

  const activePhrases = useMemo(() => {
    if (isFrenchCourse) return frenchPhrases
    if (isEnglishCourse) return englishPhrases
    return []
  }, [englishPhrases, frenchPhrases, isEnglishCourse, isFrenchCourse])

  const isAnimatedGreeting = activePhrases.length > 0

  useEffect(() => {
    if (!isAnimatedGreeting) {
      setDisplayText(`Olá, ${firstName}`)
      setPhraseIndex(0)
      setIsDeleting(false)
      return
    }

    const currentPhrase = activePhrases[phraseIndex] ?? activePhrases[0]
    const timeout = window.setTimeout(() => {
      if (!isDeleting) {
        const nextText = currentPhrase.slice(0, displayText.length + 1)
        setDisplayText(nextText)

        if (nextText === currentPhrase) {
          setIsDeleting(true)
        }

        return
      }

      const nextText = currentPhrase.slice(0, Math.max(displayText.length - 1, 0))
      setDisplayText(nextText)

      if (nextText.length === 0) {
        setIsDeleting(false)
        setPhraseIndex((currentIndex) => (currentIndex + 1) % activePhrases.length)
      }
    }, isDeleting
      ? displayText.length === currentPhrase.length
        ? HOLD_DELAY
        : DELETE_SPEED
      : TYPE_SPEED)

    return () => window.clearTimeout(timeout)
  }, [activePhrases, displayText, firstName, isAnimatedGreeting, isDeleting, phraseIndex])

  return (
    <div className="flex min-h-11 items-center">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/65 bg-clip-text text-transparent">
        {displayText}
        {isAnimatedGreeting && (
          <span className="ml-1 inline-block h-[0.95em] w-[2px] translate-y-0.5 animate-pulse rounded-full bg-primary align-middle" />
        )}
      </h1>
    </div>
  )
}
