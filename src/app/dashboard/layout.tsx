import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSessionFromCookies } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login?from=/dashboard");
  }

  return <>{children}</>;
}
