import { SupermarketManager } from "@/components/managers/SupermarketManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Supermercados",
  description:
    "Adicione, edite e remova os supermercados onde faz suas compras.",
};

export default function SupermarketsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <SupermarketManager />
    </main>
  );
}
