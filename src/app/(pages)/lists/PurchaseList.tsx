"use client";

import { usePurchases, useDeletePurchase } from "@/hooks/usePurchases";
import { toast } from "sonner";
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

  return (
    <Accordion type="single" collapsible className="w-full">
      {purchases?.map((purchase) => (
        <AccordionItem value={purchase.id} key={purchase.id}>
          <AccordionTrigger>
            <div className="flex justify-between w-full pr-4">
              <span>{new Date(purchase.date).toLocaleDateString("pt-BR")}</span>
              <span className="font-semibold">{purchase.supermarket.name}</span>
              <span className="text-green-600 font-bold">
                {formatCurrency(Number(purchase.totalValue))}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex justify-end mb-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(purchase.id)}
              >
                Deletar Compra
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
                {purchase.items.map((pItem) => (
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
