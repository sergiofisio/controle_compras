"use client";

import React from "react";
import { useMarks, useCreateMark, useDeleteMark } from "@/hooks/useMarks";
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

export function MarkManager() {
  const { data: marks, isLoading: isLoadingMarks, isError } = useMarks();
  const createMark = useCreateMark();
  const deleteMark = useDeleteMark();

  const handleCreate = (values: { name: string }) => {
    createMark.mutate(values, {
      onSuccess: () => {
        toast.success("Marca criada com sucesso!");
      },
      onError: (error) => {
        toast.error("Erro ao criar marca", {
          description: error.message,
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta marca?")) {
      deleteMark.mutate(id, {
        onSuccess: () => {
          toast.success("Marca deletada com sucesso!");
        },
        onError: (error) => {
          toast.error("Erro ao deletar marca", {
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
            <CardTitle>Adicionar Nova Marca</CardTitle>
          </CardHeader>
          <CardContent>
            <NamedEntityForm
              onSubmit={handleCreate}
              isLoading={createMark.isPending}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Marcas Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMarks && <p>Carregando marcas...</p>}
            {isError && <p>Não foi possível carregar as marcas.</p>}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks?.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell>{mark.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(mark.id)}
                        disabled={deleteMark.isPending}
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
