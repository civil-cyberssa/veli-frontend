"use client"

import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
        Navegação
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "group/button hover:bg-sidebar-accent/80 transition-all duration-200",
                    "data-[state=open]:bg-sidebar-accent/50",
                    item.isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  {item.icon && (
                    <div className={cn(
                      "flex items-center justify-center w-5 h-5 transition-transform duration-200",
                      "group-hover/button:scale-110"
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="font-medium">{item.title}</span>
                  <ChevronRight className={cn(
                    "ml-auto w-4 h-4 transition-all duration-200",
                    "group-data-[state=open]/collapsible:rotate-90",
                    "group-hover/button:text-sidebar-accent-foreground"
                  )} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="transition-all duration-200 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                <SidebarMenuSub className="ml-3 border-l-2 border-sidebar-border/50 pl-3 space-y-0.5">
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={subItem.isActive}
                        className={cn(
                          "group/subbutton hover:bg-sidebar-accent/60 transition-all duration-200",
                          "hover:translate-x-0.5",
                          subItem.isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        )}
                      >
                        <Link href={subItem.url}>
                          <span className="relative">
                            {subItem.title}
                            {subItem.isActive && (
                              <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
