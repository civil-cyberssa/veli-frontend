"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  PlayCircle,
  ClipboardList,
  MonitorPlay,
  FileText,
  Palette,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"

const baseNavData = {
  sections: [
    {
      label: "PRINCIPAL",
      items: [
        {
          title: "Dashboard",
          url: "/home",
          icon: LayoutDashboard,
        },
        {
          title: "Atividades Diárias",
          url: "/activities",
          icon: ClipboardList,
        },
      ],
    },
    {
      label: "CONTEÚDO",
      items: [
        {
          title: "Minhas Aulas",
          url: "/minhas-aulas",
          icon: PlayCircle,
        },
        {
          title: "Material de Apoio",
          url: "#",
          icon: FileText,
        },
        {
          title: "Vídeos",
          url: "#",
          icon: MonitorPlay,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.role as string | undefined)?.toLowerCase()

  // Calcula dinamicamente o isActive baseado na rota atual
  const navSectionsWithActiveState = React.useMemo(() => {
    const sections = [...baseNavData.sections]

    if (role === "manager") {
      sections.push({
        label: "ADMINISTRAÇÃO",
        items: [
          {
            title: "Cores da marca",
            url: "/admin",
            icon: Palette,
          },
        ],
      })
    }

    return sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        isActive: pathname === item.url || (item.url !== "#" && pathname.startsWith(item.url)),
      })),
    }))
  }, [pathname, role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="flex size-10 items-center justify-center rounded-xl">
            <Image
              src="/veli_logo.png"
              alt="Veli"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <div className="leading-none group-data-[collapsible=icon]:hidden">
            <span
              className="veli-thinking text-base font-bold tracking-wide"
              data-text="Veli"
            >
              Veli
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navSectionsWithActiveState} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
