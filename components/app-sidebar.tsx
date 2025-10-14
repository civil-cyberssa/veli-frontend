"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Area do aluno",
      logo: AudioWaveform,
      plan: "Plano atual: Pro",
    },
    {
      name: "Area do professor",
      logo: Command,
      plan: "Contrato ativo",
    },
  ],
  navMain: [
    {
      title: "Area do aluno",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "#",
        },
        {
          title: "Minhas aulas",
          url: "#",
        },
        {
          title: "Cursos",
          url: "#",
        },
      ],
    },
    {
      title: "Atividades",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Enviar atividade",
          url: "#",
        },
      ],
    },
    {
      title: "Conteúdos livres",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
      ],
    },
    {
      title: "Pagamentos",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Meus pagamentos",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Configurações",
      url: "#",
      icon: Frame,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
