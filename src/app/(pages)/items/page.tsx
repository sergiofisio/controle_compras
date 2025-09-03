// src/app/items/page.tsx
import { ItemManager } from "@/components/managers/ItemManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Itens",
  description: "Adicione, edite e remova os itens do seu catálogo de compras.",
};

export default function ItemsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <ItemManager />
    </main>
  );
}
