'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ColorSettings } from "@/src/features/admin/color-settings"
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

  const managerName = session?.student_full_name || "Gestor"

  if (!session || (session.role as string | undefined)?.toLowerCase() !== "manager") {
    return null
  }

  return (
    <div className="py-8">
      <ColorSettings managerName={managerName} />
    </div>
  )
}
