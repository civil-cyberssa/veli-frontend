'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    const isManager = (session?.role as string | undefined)?.toLowerCase() === "manager"
    if (!session || !isManager) {
      router.replace("/home")
    }
  }, [session, status, router])

  if (!session || (session.role as string | undefined)?.toLowerCase() !== "manager") {
    return null
  }

  return (
    <div className="py-8">
      <div className="rounded-lg border border-border/50 bg-card/60 p-6 text-sm text-muted-foreground">
        Personalização de cores removida.
      </div>
    </div>
  )
}
