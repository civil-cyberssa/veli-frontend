import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import authOptions from "@/src/utils/authOptions"
import { ColorSettings } from "@/src/features/admin/color-settings"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.role as string | undefined)?.toLowerCase() !== "gestor") {
    redirect("/home")
  }

  const managerName = session.student_full_name || session.user?.name

  return (
    <div className="py-8">
      <ColorSettings managerName={managerName} />
    </div>
  )
}
