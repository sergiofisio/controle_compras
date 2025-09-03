import { CategoryManager } from "@/components/managers/CategoryManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Categorias",
  description: "Adicione, edite e remova as categorias de produtos.",
};

export default function CategoriesPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <CategoryManager />
    </main>
  );
}
