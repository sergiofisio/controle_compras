// src/app/purchases/page.tsx
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import { PurchaseList } from "../lists/PurchaseList";

export const metadata: Metadata = {
  title: "Histórico de Compras",
  description: "Visualize todas as suas compras registradas.",
};

export default function PurchasesPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Histórico de Compras</h1>
        <Button asChild>
          <Link href="/purchases/new">Registrar Nova Compra</Link>
        </Button>
      </div>
      <PurchaseList />
    </main>
  );
}
