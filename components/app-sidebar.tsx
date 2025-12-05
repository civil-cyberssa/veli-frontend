"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  AudioWaveform,
  SquareTerminal,
  PlayCircle,
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
      logo: AudioWaveform,
      plan: "Portal do Estudante",
    },
  ],
  navMain: [
    {
      title: "Área do Aluno",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Dashboard",
          url: "/home",
        },
      ],
    },
    {
      title: "Aulas",
      url: "#",
      icon: PlayCircle,
      items: [
        {
          title: "Minhas Aulas",
          url: "/home",
        },
      ],
    },
    {
      title: "Conteúdo",
      url: "#",
      icon: MonitorPlay,
      items: [],
    },
    {
      title: "Material",
      url: "#",
      icon: FileText,
      items: [],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.role as string | undefined)?.toLowerCase()

  // Calcula dinamicamente o isActive baseado na rota atual
  const navMainWithActiveState = React.useMemo(() => {
    const items = [...baseNavData.navMain]

    if (role === "manager") {
      items.push({
        title: "Administração",
        url: "#",
        icon: Palette,
        items: [
          {
            title: "Cores da marca",
            url: "/admin",
          },
        ],
      })
    }

    return items.map((item) => {
      // Verifica se algum sub-item está ativo
      const hasActiveSubItem = item.items?.some((subItem) => pathname === subItem.url)

      return {
        ...item,
        isActive: hasActiveSubItem || false,
        items: item.items?.map((subItem) => ({
          ...subItem,
          isActive: pathname === subItem.url,
        })),
      }
    })
  }, [pathname, role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={baseNavData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActiveState} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
