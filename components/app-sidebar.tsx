"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  AudioWaveform,
  SquareTerminal,
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // Calcula dinamicamente o isActive baseado na rota atual
  const navMainWithActiveState = React.useMemo(() => {
    return baseNavData.navMain.map((item) => {
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
  }, [pathname])

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
