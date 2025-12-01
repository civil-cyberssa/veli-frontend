"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Mapeamento de rotas para breadcrumbs
const routeBreadcrumbs: Record<string, { parent?: { label: string; href: string }, current: string }> = {
  "/home": {
    parent: { label: "Área do aluno", href: "#" },
    current: "Dashboard"
  },
  "/profile/edit": {
    parent: { label: "Perfil", href: "#" },
    current: "Editar"
  },
}

export default function Layout({children}: {children: React.ReactNode}) {
  const pathname = usePathname()

  // Detecta se é uma rota de aulas
  const isLessonRoute = pathname.startsWith('/aulas/')

  // Para rotas de aulas, não mostra breadcrumb
  let breadcrumb = routeBreadcrumbs[pathname] || routeBreadcrumbs["/home"]

  if (isLessonRoute) {
    breadcrumb = {
      parent: { label: "Cursos", href: "/home" },
      current: "Aula"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {!isLessonRoute && (
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumb.parent && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={breadcrumb.parent.href}>
                          {breadcrumb.parent.label}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumb.current}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
        )}
        <div className={isLessonRoute ? "flex flex-1 flex-col" : "flex flex-1 flex-col gap-4 px-6"}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
