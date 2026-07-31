"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

import {
  getNavigationSections,
  isNavigationItemActive,
} from "@/components/navigation-items"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.role as string | undefined)?.toLowerCase()
  const items = getNavigationSections(role).flatMap((section) => section.items)

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-18px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
    >
      <div
        className="mx-auto grid h-16 w-full max-w-lg items-stretch px-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const isActive = isNavigationItemActive(pathname, item.url)
          const Icon = item.icon

          return (
            <Link
              key={item.url}
              href={item.url}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1 text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <span
                className={cn(
                  "flex h-7 min-w-10 items-center justify-center rounded-full px-3 transition-all",
                  isActive && "bg-primary/10"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="w-full truncate text-center text-[10px] font-medium leading-none">
                {item.mobileTitle}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
