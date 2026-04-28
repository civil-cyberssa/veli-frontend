"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { HeaderUserControls } from "@/components/header-user-controls"

export default function Layout({children}: {children: React.ReactNode}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(!pathname.startsWith("/course/"))

  useEffect(() => {
    setIsSidebarOpen(!pathname.startsWith("/course/"))
  }, [pathname])

  // Detectar se está no ambiente de aprendizagem (página de aulas)
  const isLessonPage = pathname.startsWith('/aulas')
  const isBackButtonPage = pathname.startsWith("/course/") || pathname === "/profile/edit"

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }

    router.push("/home")
  }

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
            {isBackButtonPage ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleGoBack}
                className="-ml-1 h-9 w-9 rounded-full hover:bg-accent"
                aria-label="Voltar"
                title="Voltar"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-accent-foreground transition-colors rounded-md" />
            )}
            <HeaderUserControls />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
