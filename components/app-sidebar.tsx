"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"

const navItems = [
  {
    title: "Dashboard",
    url: "/home",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Configurações",
    url: "#",
    icon: Settings,
    items: [
      {
        title: "Editar Perfil",
        url: "/profile/edit",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
