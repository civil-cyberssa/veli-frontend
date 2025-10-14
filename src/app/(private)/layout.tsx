import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import authOptions from "@/src/utils/authOptions";
import Layout from "@/src/features/layout/layout";

interface PrivateLayoutProps {
  children: ReactNode;
}

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  return <Layout>{children}</Layout>;
}
