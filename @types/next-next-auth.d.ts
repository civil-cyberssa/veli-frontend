import "next-auth"

declare module "next-auth" {
  interface Session {
    refresh: string
    access: string
    first_name: string
    last_name: string
    email: string
    id: number
    last_login: string
    profile_pic: string
  }
}