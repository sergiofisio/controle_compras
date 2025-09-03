import { MarkManager } from "@/components/managers/MarkManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Marcas",
  description: "Adicione, edite e remova as marcas dos produtos.",
};

export default function MarksPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <MarkManager />
    </main>
  );
}
