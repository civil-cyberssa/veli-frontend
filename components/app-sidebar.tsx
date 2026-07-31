"use client"

import * as React from "react"
import Image from "next/image"
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
        <div className="flex items-center justify-center px-3 py-2 group-data-[collapsible=icon]:px-2">
          <Image
            src="/Veli_logo fundo azul médio.png"
            alt="Veli"
            width={1080}
            height={671}
            className="h-auto w-[5.6rem] rounded-xl object-contain group-data-[collapsible=icon]:w-[2.1rem]"
            priority
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navSectionsWithActiveState} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
