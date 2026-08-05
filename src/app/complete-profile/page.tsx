import { getServerSession, type Session } from "next-auth"
import { redirect } from "next/navigation"
import { ProfileCompletionWelcome } from "@/src/features/profile-completion/profile-completion-welcome"
import authOptions from "@/src/utils/authOptions"

export default async function CompleteProfilePage() {
  const session = (await getServerSession(authOptions)) as Session | null

  if (!session) {
    redirect("/auth")
  }

  if (session.completed_profile !== false) {
    redirect("/home")
  }

  return <ProfileCompletionWelcome />
}
