"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 overflow-y-auto bg-white p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
