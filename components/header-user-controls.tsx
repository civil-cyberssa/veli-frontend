"use client"

import { Loader2, Moon, Sun } from "lucide-react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"

import { UserDropdown } from "@/components/user-dropdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function HeaderUserControls() {
  const { data: session, status } = useSession()
  const { resolvedTheme, setTheme } = useTheme()

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-2 shadow-sm">
          <Sun className="h-4 w-4 text-muted-foreground" />
          <Switch checked={false} disabled aria-label="Alternar tema" />
          <Moon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!session) return null

  const fullName = session.student_full_name || "Usuário"
  const profilePic = session.profile_pic_url || ""
  const nameParts = fullName.split(" ")
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : fullName.substring(0, 2).toUpperCase()

  const isDark = resolvedTheme === "dark"

  return (
    <div className="ml-auto flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-2 shadow-sm backdrop-blur">
        <Sun className={cn("h-4 w-4", !isDark ? "text-amber-500" : "text-muted-foreground")} />
        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label="Alternar tema"
        />
        <Moon className={cn("h-4 w-4", isDark ? "text-sky-500" : "text-muted-foreground")} />
      </div>

      <UserDropdown
        trigger={
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 shadow-sm transition-all hover:scale-[1.03] hover:border-border hover:shadow-md"
            aria-label="Abrir menu do usuário"
          >
            <Avatar className="h-9 w-9 rounded-full">
              <AvatarImage src={profilePic} alt={fullName} className="object-cover" />
              <AvatarFallback className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        }
        className="min-w-52 rounded-xl shadow-lg"
      />
    </div>
  )
}
