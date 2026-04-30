import "./globals.css";
import { Providers } from "@/app/providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Home | Controle Compras",
    template: "%s | Controle Compras",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
