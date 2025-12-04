'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, UserRound } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { ModeToggle } from '@/components/shared/theme-toggle-mode'
import { Input } from '@/components/ui/input'
import { UserDropdown } from '@/components/user-dropdown'

// Estilos do tour interativo
import '@/src/features/lessons/styles/course-tour.css'

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
    <div className="min-h-screen bg-background animate-fade-in">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between gap-4 px-4 md:h-16 md:px-6">
          <Link href="/home" className="flex items-center gap-2 font-semibold">
            <Image
              src="/logo/logo.svg"
              alt="Veli"
              width={24}
              height={24}
              className="h-7 w-auto"
              priority
            />
            <span className="hidden text-base font-semibold leading-none sm:inline">Veli</span>
          </Link>

          <div className="flex flex-1 items-center gap-2 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar aulas"
                className="pl-9"
                aria-label="Buscar aulas"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <UserDropdown
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              trigger={
                <button className="flex items-center gap-2 rounded-full border px-2 py-1 shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                  <div className="flex items-center justify-center h-9 w-9 overflow-hidden rounded-full bg-muted">
                    {profilePic ? (
                      <Image
                        src={profilePic}
                        alt={fullName}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                        {initials || <UserRound className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                  <div className="hidden flex-col leading-tight text-left sm:flex">
                    <span className="text-sm font-medium text-foreground">{fullName}</span>
                    <span className="text-xs text-muted-foreground">{role}</span>
                  </div>
                </button>
              }
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 animate-slide-up">
        {children}
      </main>

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
