"use client";

import { useI18n } from "@/i18n";

export function PriceVariationCard({ value }: { value: number }) {
  const { t } = useI18n();
  return (
    <div className="rounded bg-white p-4 shadow">
      <p className="text-sm text-slate-500">{t("dashboard.priceVariation")}</p>
      <p className="text-2xl font-semibold">{value.toFixed(2)}%</p>
    </div>
  );
}
