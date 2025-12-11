'use client'

import Image from 'next/image'
import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { ModeToggle } from '@/components/shared/theme-toggle-mode'
import { UserDropdown } from '@/components/user-dropdown'
import { Footer } from '@/src/components/footer'

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()

  const fullName = session?.student_full_name ?? 'Aluno'
  const profilePic = session?.profile_pic_url ?? ''
  const role = session?.role ?? 'Estudante'
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background animate-fade-in flex flex-col">


      <main className="flex-1 px-4 py-6 animate-slide-up">
        {children}
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-delay-100 {
          animation-delay: 0.1s;
          animation-fill-mode: both;
        }

        .animate-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animate-delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}
