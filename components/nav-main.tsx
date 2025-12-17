"use client"

import Link from "next/link"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  sections,
}: {
  sections: {
    label: string
    items: {
      title: string
      url: string
      icon?: LucideIcon
      isActive?: boolean
    }[]
  }[]
}) {
  return (
    <>
      {sections.map((section) => (
        <SidebarGroup key={section.label} className="py-0">
          <SidebarGroupLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/50">
            {section.label}
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-0.5 px-2">
            {section.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={item.isActive}
                  className={cn(
                    "group/item h-10 px-3 hover:bg-sidebar-accent/80 transition-all duration-200",
                    item.isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm",
                    !item.isActive && "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3 w-full">
                    {item.icon && (
                      <div className={cn(
                        "flex items-center justify-center transition-transform duration-200",
                        "group-hover/item:scale-110"
                      )}>
                        <item.icon className={cn(
                          "w-[18px] h-[18px]",
                          item.isActive && "text-primary"
                        )} />
                      </div>
                    )}
                    <span className="font-medium text-[13px]">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
