"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { ChevronsLeft, ChevronsRight } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  getNavigationSections,
  isNavigationItemActive,
} from "@/components/navigation-items"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { open, toggleSidebar } = useSidebar()
  const role = (session?.role as string | undefined)?.toLowerCase()

  // Calcula dinamicamente o isActive baseado na rota atual
  const navSectionsWithActiveState = React.useMemo(() => {
    const sections = getNavigationSections(role)

    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        isActive: isNavigationItemActive(pathname, item.url),
      })),
    }))
  }, [pathname, role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex justify-end px-2 pt-2 group-data-[collapsible=icon]:justify-center">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={open ? "Recolher menu" : "Expandir menu"}
            title={open ? "Recolher menu" : "Expandir menu"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {open ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navSectionsWithActiveState} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
