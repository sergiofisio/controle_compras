"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePurchases } from "@/hooks/usePurchases";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { DollarSign, ShoppingCart, CreditCard } from "lucide-react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function Home() {
  const { data: purchases } = usePurchases();

  const stats = useMemo(() => {
    if (!purchases) {
      return {
        totalSpentThisMonth: 0,
        purchasesThisMonth: 0,
        averageTicket: 0,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const purchasesThisMonth = purchases.filter((p) => {
      const purchaseDate = new Date(p.date);
      return (
        purchaseDate.getMonth() === currentMonth &&
        purchaseDate.getFullYear() === currentYear
      );
    });

    const totalSpentThisMonth = purchasesThisMonth.reduce(
      (acc, p) => acc + Number(p.totalValue),
      0
    );
    const averageTicket =
      purchasesThisMonth.length > 0
        ? totalSpentThisMonth / purchasesThisMonth.length
        : 0;

    return {
      totalSpentThisMonth,
      purchasesThisMonth: purchasesThisMonth.length,
      averageTicket,
    };
  }, [purchases]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/purchases/new">Registrar Nova Compra</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Gasto (Mês Atual)"
          value={formatCurrency(stats.totalSpentThisMonth)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Nº de Compras (Mês Atual)"
          value={stats.purchasesThisMonth}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Ticket Médio (Mês Atual)"
          value={formatCurrency(stats.averageTicket)}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Gastos Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <SpendingChart purchases={purchases} />
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>Não há dados de compras para exibir o gráfico.</p>
              <p className="text-sm mt-2">
                Comece registrando uma nova compra.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
