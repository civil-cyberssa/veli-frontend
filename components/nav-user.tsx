"use client"

import { ChevronsUpDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { UserDropdown } from "./user-dropdown"
import { useSession } from "next-auth/react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { data: session, status } = useSession()

  // Verifica se está carregando
  if (status === "loading") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">...</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Carregando...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Se não houver sessão, não renderiza
  if (!session) {
    return null
  }

  const fullName = session.student_full_name || "Usuário"
  const profilePic = session.profile_pic_url || ""
  const role = session.role || ""

  // Extrai as iniciais do nome completo
  const nameParts = fullName.split(" ")
  const initials = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : fullName.substring(0, 2).toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserDropdown
          side={isMobile ? "bottom" : "right"}
          trigger={
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profilePic} alt={fullName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="truncate text-xs capitalize">{role}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          }
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
