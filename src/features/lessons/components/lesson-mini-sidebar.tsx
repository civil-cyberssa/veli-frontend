'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Menu,
  PlayCircle,
  MonitorPlay,
  FileText,
  X,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function LessonMiniSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/home',
      onClick: () => router.push('/home'),
    },
    {
      icon: PlayCircle,
      label: 'Aulas',
      href: '/aulas',
      isActive: pathname.startsWith('/aulas'),
    },
    {
      icon: MonitorPlay,
      label: 'Conteúdo',
      href: '#conteudo',
      onClick: () => {
        // Scroll para a seção de conteúdo ou abre tab de conteúdo
        document.querySelector('[data-state="active"]')?.scrollIntoView({ behavior: 'smooth' })
      },
    },
    {
      icon: FileText,
      label: 'Material',
      href: '#material',
      onClick: () => {
        // Trigger click na tab de material
        const materialTab = document.querySelector('[data-value="material"]') as HTMLElement
        materialTab?.click()
      },
    },
  ]

  return (
    <>
      {/* Botão toggle (sempre visível) */}
      <div className="fixed left-4 top-20 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 w-10 rounded-full shadow-lg bg-background border-border/50"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar colapsável */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-16 bg-background border-r border-border/50 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col items-center gap-2 pt-24 px-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={item.isActive ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-12 w-12 rounded-lg transition-colors',
                item.isActive && 'bg-primary text-primary-foreground'
              )}
              onClick={item.onClick}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
      </div>

      {/* Overlay (fecha ao clicar fora) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
