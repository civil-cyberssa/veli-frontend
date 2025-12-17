"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  PlayCircle,
  ClipboardList,
  MonitorPlay,
  FileText,
  Palette,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"

const baseNavData = {
  teams: [
    {
      name: "Área do Aluno",
      logo: LayoutDashboard,
      plan: "Portal do Estudante",
    },
  ],
  sections: [
    {
      label: "PRINCIPAL",
      items: [
        {
          title: "Dashboard",
          url: "/home",
          icon: LayoutDashboard,
        },
        {
          title: "Atividades Diárias",
          url: "/activities",
          icon: ClipboardList,
        },
      ],
    },
    {
      label: "CONTEÚDO",
      items: [
        {
          title: "Minhas Aulas",
          url: "/home",
          icon: PlayCircle,
        },
        {
          title: "Material de Apoio",
          url: "#",
          icon: FileText,
        },
        {
          title: "Vídeos",
          url: "#",
          icon: MonitorPlay,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.role as string | undefined)?.toLowerCase()

  // Calcula dinamicamente o isActive baseado na rota atual
  const navSectionsWithActiveState = React.useMemo(() => {
    const sections = [...baseNavData.sections]

    if (role === "manager") {
      sections.push({
        label: "ADMINISTRAÇÃO",
        items: [
          {
            title: "Cores da marca",
            url: "/admin",
            icon: Palette,
          },
        ],
      })
    }

    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    }))
  }, [pathname, role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={baseNavData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navSectionsWithActiveState} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
