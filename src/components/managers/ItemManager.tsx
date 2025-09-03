"use client";
import React from "react";
import { useItems, useCreateItem, useDeleteItem } from "@/hooks/useItems";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ItemForm } from "../forms/ItemForm";
import { ItemCreateData } from "@/backend/type/type";

export function ItemManager() {
  const { data: items, isLoading: isLoadingItems, isError } = useItems();
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();

  const handleCreate = (values: ItemCreateData) => {
    createItem.mutate(values, {
      onSuccess: () => toast.success("Item criado com sucesso!"),
      onError: (error) =>
        toast.error("Erro ao criar item", { description: error.message }),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      deleteItem.mutate(id, {
        onSuccess: () => toast.success("Item deletado com sucesso!"),
        onError: (error) =>
          toast.error("Erro ao deletar item", { description: error.message }),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Item</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemForm
              onSubmit={handleCreate}
              isLoading={createItem.isPending}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Itens Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingItems && <p>Carregando itens...</p>}
            {isError && <p>Não foi possível carregar os itens.</p>}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category.name}</TableCell>
                    <TableCell>{item.mark.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteItem.isPending}
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
