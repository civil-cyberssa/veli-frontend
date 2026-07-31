import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Palette,
  PlayCircle,
} from "lucide-react"

export interface NavigationItem {
  title: string
  mobileTitle: string
  url: string
  icon: LucideIcon
}

export interface NavigationSection {
  label: string
  items: NavigationItem[]
}

const baseNavigationSections: NavigationSection[] = [
  {
    label: "PRINCIPAL",
    items: [
      {
        title: "Dashboard",
        mobileTitle: "Início",
        url: "/home",
        icon: LayoutDashboard,
      },
      {
        title: "Atividades Diárias",
        mobileTitle: "Atividades",
        url: "/activities",
        icon: ClipboardList,
      },
      {
        title: "Financeiro",
        mobileTitle: "Financeiro",
        url: "/financeiro",
        icon: CreditCard,
      },
      {
        title: "Cursos disponíveis",
        mobileTitle: "Cursos",
        url: "/cursos-disponiveis",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "CONTEÚDO",
    items: [
      {
        title: "Minhas Aulas",
        mobileTitle: "Aulas",
        url: "/minhas-aulas",
        icon: PlayCircle,
      },
    ],
  },
]

const managerNavigationSection: NavigationSection = {
  label: "ADMINISTRAÇÃO",
  items: [
    {
      title: "Cores da marca",
      mobileTitle: "Admin",
      url: "/admin",
      icon: Palette,
    },
  ],
}

export function getNavigationSections(role?: string): NavigationSection[] {
  if (role === "manager") {
    return [...baseNavigationSections, managerNavigationSection]
  }

  return baseNavigationSections
}

export function isNavigationItemActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
}
