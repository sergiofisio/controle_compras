import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Controle de Compras",
  description: "Gerencie suas compras de forma inteligente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-screen bg-gray-100"
      suppressHydrationWarning
    >
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased h-screen`}
      >
        <Providers>
          <div className="flex h-full max-w-screen w-screen">
            <Sidebar />
            <div className="w-full">
              <Header />
              <main className="flex-1 overflow-y-auto bg-white">
                {children}
              </main>
            </div>
          </div>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
