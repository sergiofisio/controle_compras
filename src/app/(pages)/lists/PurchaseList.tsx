"use client";

import { usePurchases, useDeletePurchase } from "@/hooks/usePurchases";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PurchaseItemWithDetails } from "@/backend/type/type";

// Helper para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export function PurchaseList() {
  const { data: purchases, isLoading } = usePurchases();
  const deletePurchase = useDeletePurchase();

  const handleDelete = (id: string) => {
    if (
      confirm(
        "Tem certeza que deseja deletar esta compra? Esta ação é irreversível."
      )
    ) {
      deletePurchase.mutate(id, {
        onSuccess: () => toast.success("Compra deletada com sucesso!"),
        onError: (error) =>
          toast.error("Erro ao deletar compra", { description: error.message }),
      });
    }
  };

  if (isLoading) return <p>Carregando histórico de compras...</p>;

  // MELHORIA: Tratamento do estado vazio
  if (!purchases || purchases.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Nenhuma compra registrada ainda.</p>
        <p className="mt-2">Clique em "Registrar Nova Compra" para começar.</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {purchases.map((purchase) => (
        <AccordionItem value={purchase.id} key={purchase.id}>
          <AccordionTrigger>
            <div className="flex flex-col md:flex-row justify-between w-full pr-4 text-left md:text-center gap-2 md:gap-0">
              {/* MELHORIA: Formatação de data com date-fns */}
              <span className="md:w-1/3">
                {format(new Date(purchase.date), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </span>
              <span className="font-semibold md:w-1/3">
                {purchase.supermarket.name}
              </span>
              <span className="text-green-600 font-bold md:w-1/3 md:text-right">
                {formatCurrency(Number(purchase.totalValue))}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex justify-end mb-4">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(purchase.id)}
                disabled={
                  deletePurchase.isPending &&
                  deletePurchase.variables === purchase.id
                }
              >
                {deletePurchase.isPending &&
                deletePurchase.variables === purchase.id
                  ? "Deletando..."
                  : "Deletar Compra"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items.map((pItem: PurchaseItemWithDetails) => (
                  <TableRow key={pItem.id}>
                    <TableCell>{pItem.item.name}</TableCell>
                    <TableCell>{pItem.item.mark.name}</TableCell>
                    <TableCell>{pItem.quantity}</TableCell>
                    <TableCell>{formatCurrency(Number(pItem.price))}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(pItem.total))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
