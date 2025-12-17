"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
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
  "/admin": [
    { label: "Administração", href: "#" },
    { label: "Cores da marca" },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(!pathname.startsWith("/course/"))

  useEffect(() => {
    setIsSidebarOpen(!pathname.startsWith("/course/"))
  }, [pathname])

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
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sticky top-0 z-10">
          <div className="flex items-center gap-3 px-6 w-full">
            <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-accent-foreground transition-colors rounded-md" />
            <Separator
              orientation="vertical"
              className="mr-1 h-5 bg-border/60"
            />
            <Breadcrumb>
              <BreadcrumbList className="text-sm">
                {breadcrumb.map((item, index) => {
                  const isLast = index === breadcrumb.length - 1

                  return (
                    <Fragment key={`${item.label}-${index}`}>
                      <BreadcrumbItem>
                        {isLast || !item.href ? (
                          <BreadcrumbPage className="font-medium text-foreground">
                            {item.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={item.href}
                            className="transition-colors hover:text-foreground text-muted-foreground"
                          >
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumb.length - 1 && (
                        <BreadcrumbSeparator className="text-muted-foreground/50" />
                      )}
                    </Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
