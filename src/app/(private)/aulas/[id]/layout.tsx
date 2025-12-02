'use client'

import { ModeToggle } from '@/components/shared/theme-toggle-mode'

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header compacto */}
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-end px-4">
          <ModeToggle />
        </div>
      </header>

      {/* Conteúdo principal com animação */}
      <main className="px-4 py-6 animate-slide-up">
        {children}
      </main>

      {/* Estilos de animação */}
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
