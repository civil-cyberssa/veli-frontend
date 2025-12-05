'use client'
import { redirect } from "next/navigation"
import { ColorSettings } from "@/src/features/admin/color-settings"
import { useSession } from "next-auth/react"

export default async function AdminPage() {
  const { data:session } = useSession()

  if (!session || (session.role as string | undefined)?.toLowerCase() !== "manager") {
    redirect("/home")
  }

  const managerName = session.student_full_name || "Gestor" 

  return (
    <div className="py-8">
      <ColorSettings managerName={managerName} />
    </div>
  )
}
