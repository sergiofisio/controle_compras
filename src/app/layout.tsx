import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Providers from "./providers";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Controle de Compras",
  description: "Gerencie suas compras de forma inteligente.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full bg-gray-100">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased h-full`}
        suppressHydrationWarning
      >
        <Providers>
          <AppLayout>{children}</AppLayout>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
