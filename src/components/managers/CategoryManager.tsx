"use client";

import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { NamedEntityForm } from "../forms/NamedEntityForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";

export function CategoryManager() {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError,
  } = useCategories();
  const create = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = (values: { name: string }) => {
    create.mutate(values, {
      onSuccess: () => {
        toast.success("Categoria criada com sucesso");
      },
      onError: (error) => {
        toast.error("Erro ao criar categoria", {
          description: error.message,
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta categoria?")) {
      deleteCategory.mutate(id, {
        onSuccess: () => {
          toast.success("Categoria deletada com sucesso!");
        },
        onError: (error) => {
          toast.error("Erro ao deletar categoria", {
            description: error.message,
          });
        },
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <NamedEntityForm
              onSubmit={handleCreate}
              isLoading={create.isPending}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Categorias Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCategories && <p>Carregando categorias...</p>}
            {isError && <p>Não foi possível carregar as categorias.</p>}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        disabled={deleteCategory.isPending}
                      >
                        Deletar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
