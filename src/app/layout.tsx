import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";

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
    <html lang="pt-BR" className="h-full bg-gray-100" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-white">{children}</main>
          </div>
          <Toaster richColors />
          <LoadingOverlay />
        </Providers>
      </body>
    </html>
  );
}
