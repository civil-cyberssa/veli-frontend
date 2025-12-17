"use client"

import { ChevronsUpDown, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
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
          <SidebarMenuButton
            size="lg"
            className={cn(
              "border border-sidebar-border/50 shadow-sm",
              "bg-sidebar-accent/30"
            )}
          >
            <Avatar className="h-9 w-9 rounded-xl border-2 border-background shadow-md">
              <AvatarFallback className="rounded-xl bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium animate-pulse">Carregando...</span>
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
              className={cn(
                "group hover:bg-sidebar-accent/80 transition-all duration-200",
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                "shadow-sm hover:shadow-md border border-sidebar-border/50"
              )}
            >
              <Avatar className={cn(
                "h-9 w-9 rounded-xl border-2 border-background shadow-md",
                "group-hover:scale-105 transition-transform duration-200"
              )}>
                <AvatarImage src={profilePic} alt={fullName} className="object-cover" />
                <AvatarFallback className={cn(
                  "rounded-xl font-semibold text-sm",
                  "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
                )}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{fullName}</span>
                <span className="truncate text-xs capitalize text-sidebar-foreground/60">{role}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </SidebarMenuButton>
          }
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl shadow-lg"
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
