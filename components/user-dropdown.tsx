"use client"

import { type ReactNode } from "react"
import { LogOut, UserCog } from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu"

export type UserDropdownProps = {
  trigger: ReactNode
  align?: DropdownMenuContentProps["align"]
  side?: DropdownMenuContentProps["side"]
  sideOffset?: number
  className?: string
}

export function UserDropdown({
  trigger,
  align = "end",
  side = "right",
  sideOffset = 4,
  className,
}: UserDropdownProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <>{trigger}</>
  }

  if (!session) return null

  const fullName = session.student_full_name || "Usuário"
  const profilePic = session.profile_pic_url || ""
  const role = session.role || ""

  const nameParts = fullName.split(" ")
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : fullName.substring(0, 2).toUpperCase()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={className}
        align={align}
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={profilePic} alt={fullName} />
              <AvatarFallback className="rounded-full">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{fullName}</span>
              <span className="truncate text-xs capitalize">{role}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile/edit" className="cursor-pointer">
              <UserCog />
              Meu perfil
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
