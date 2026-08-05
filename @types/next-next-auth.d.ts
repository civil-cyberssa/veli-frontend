import "next-auth"

declare module "next-auth" {
  interface Session {
    refresh: string
    access: string
    token: string
    role: string
    student_full_name: string
    profile_pic_url?: string | null
    languages: Array<{
      id: number
      name: string
      lang_icon?: string
      lang_description?: string
    }>
    completed_profile: boolean
    account_created: boolean
    linked_existing_user: boolean
  }
}
