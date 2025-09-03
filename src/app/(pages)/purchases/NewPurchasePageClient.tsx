"use client";

import { PurchaseCreateData } from "@/backend/type/type";
import { PurchaseForm } from "@/components/forms/PurchaseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewPurchasePageClient() {
  const router = useRouter();
  const createPurchase = useCreatePurchase();

  const handleSubmit = (values: PurchaseCreateData) => {
    createPurchase.mutate(values, {
      onSuccess: () => {
        toast.success("Compra registrada com sucesso!");
        router.push("/purchases");
      },
      onError: (error) => {
        toast.error("Erro ao registrar compra", {
          description: error.message,
        });
      },
    });
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Registrar Nova Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseForm
            onSubmit={handleSubmit}
            isLoading={createPurchase.isPending}
          />
        </CardContent>
      </Card>
    </main>
  );
}
