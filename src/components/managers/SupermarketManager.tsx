"use client";

import React from "react";
import {
  useSupermarkets,
  useCreateSupermarket,
  useDeleteSupermarket,
} from "@/hooks/useSupermarkets";
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
import { NamedEntityForm } from "../forms/NamedEntityForm";

export function SupermarketManager() {
  const {
    data: supermarkets,
    isLoading: isLoadingSupermarkets,
    isError,
  } = useSupermarkets();
  const createSupermarket = useCreateSupermarket();
  const deleteSupermarket = useDeleteSupermarket();

  const handleCreate = (values: { name: string }) => {
    createSupermarket.mutate(values, {
      onSuccess: () => {
        toast.success("Supermercado criado com sucesso!");
      },
      onError: (error) => {
        toast.error("Erro ao criar supermercado", {
          description: error.message,
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este supermercado?")) {
      deleteSupermarket.mutate(id, {
        onSuccess: () => {
          toast.success("Supermercado deletado com sucesso!");
        },
        onError: (error) => {
          toast.error("Erro ao deletar supermercado", {
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
            <CardTitle>Adicionar Novo Supermercado</CardTitle>
          </CardHeader>
          <CardContent>
            <NamedEntityForm
              onSubmit={handleCreate}
              isLoading={createSupermarket.isPending}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Supermercados Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSupermarkets && <p>Carregando supermercados...</p>}
            {isError && <p>Não foi possível carregar os supermercados.</p>}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supermarkets?.map((supermarket) => (
                  <TableRow key={supermarket.id}>
                    <TableCell>{supermarket.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(supermarket.id)}
                        disabled={deleteSupermarket.isPending}
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
