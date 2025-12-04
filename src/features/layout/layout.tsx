"use client"

import { useMemo } from "react"
import { useParams, usePathname } from "next/navigation"
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
import { useSubscriptions } from "@/src/features/dashboard/hooks/useSubscription"

// Mapeamento de rotas para breadcrumbs
const routeBreadcrumbs: Record<string, { label: string; href?: string }[]> = {
  "/home": [
    { label: "Área do aluno", href: "#" },
    { label: "Dashboard" },
  ],
  "/profile/edit": [
    { label: "Perfil", href: "#" },
    { label: "Editar" },
  ],
}

export default function Layout({children}: {children: React.ReactNode}) {
  const pathname = usePathname()
  const params = useParams()
  const { data: subscriptions } = useSubscriptions()

  const courseId = useMemo(() => {
    const rawId = params?.id
    if (typeof rawId === "string") {
      const parsed = Number(rawId)
      return Number.isNaN(parsed) ? null : parsed
    }

    return null
  }, [params?.id])

  const courseName = useMemo(() => {
    if (!courseId || !subscriptions) return null
    return subscriptions.find((subscription) => subscription.id === courseId)?.course_name ?? null
  }, [courseId, subscriptions])

  const breadcrumb = useMemo(() => {
    if (pathname.startsWith("/course/")) {
      return [
        { label: "Área do aluno", href: "#" },
        { label: "Dashboard", href: "/home" },
        { label: "cursos", href: "#" },
        { label: courseName ?? "Curso" },
      ]
    }

    return routeBreadcrumbs[pathname] || routeBreadcrumbs["/home"]
  }, [pathname, courseName])

  // Detectar se está no ambiente de aprendizagem (página de aulas)
  const isLessonPage = pathname.startsWith('/aulas')

  // Se estiver na página de aulas, ocultar completamente o layout com sidebar
  if (isLessonPage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((item, index) => {
                  const isLast = index === breadcrumb.length - 1

                  return (
                    <BreadcrumbItem key={`${item.label}-${index}`}>
                      {isLast || !item.href ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      )}
                      {index < breadcrumb.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </BreadcrumbItem>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
