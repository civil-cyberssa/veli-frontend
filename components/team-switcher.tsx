"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "group hover:bg-sidebar-accent/80 transition-all duration-200",
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                "shadow-sm hover:shadow-md border border-sidebar-border/50"
              )}
            >
              <div className={cn(
                "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                "flex aspect-square size-9 items-center justify-center rounded-xl shadow-md",
                "group-hover:scale-105 transition-transform duration-200"
              )}>
                <activeTeam.logo className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeTeam.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/60">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl shadow-lg border-sidebar-border/50"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-3 py-2">
              Áreas
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className={cn(
                  "gap-3 p-2.5 mx-1 rounded-lg cursor-pointer",
                  "hover:bg-sidebar-accent transition-colors duration-150",
                  activeTeam.name === team.name && "bg-sidebar-accent/50"
                )}
              >
                <div className={cn(
                  "flex size-7 items-center justify-center rounded-lg border shadow-sm",
                  "bg-gradient-to-br from-muted to-muted/50"
                )}>
                  <team.logo className="size-4 shrink-0" />
                </div>
                <span className="font-medium">{team.name}</span>
                <DropdownMenuShortcut className="opacity-60">⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="gap-3 p-2.5 mx-1 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors duration-150">
              <div className="flex size-7 items-center justify-center rounded-lg border border-dashed bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Adicionar área</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
