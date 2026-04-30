export type DiscountType = "none" | "percent" | "bulk";

export const UNIT_OPTIONS = ["unidade", "kg", "g", "l", "ml", "pacote"] as const;
export const STORE_TYPE_OPTIONS = ["supermercado", "mercado", "farmacia", "outro"] as const;

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseCurrencyInput(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return { value: 0, display: "" };
  const value = Number(digits) / 100;
  return { value, display: formatCurrency(value) };
}

export function calculateLine(item: {
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountPercent: number;
  promoQty: number;
  promoPrice: number;
}) {
  if (item.discountType === "percent") {
    const percent = Math.max(0, Math.min(100, item.discountPercent));
    const total = item.quantity * item.unitPrice * (1 - percent / 100);
    return { lineTotal: total, finalUnitPrice: item.quantity ? total / item.quantity : item.unitPrice };
  }

  if (item.discountType === "bulk") {
    const packQty = Math.max(1, item.promoQty);
    const bundles = Math.floor(item.quantity / packQty);
    const rest = item.quantity % packQty;
    const total = bundles * item.promoPrice + rest * item.unitPrice;
    return { lineTotal: total, finalUnitPrice: item.quantity ? total / item.quantity : item.unitPrice };
  }

  return { lineTotal: item.quantity * item.unitPrice, finalUnitPrice: item.unitPrice };
}
