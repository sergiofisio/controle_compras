export function PriceVariationCard({ value }: { value: number }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <p className="text-sm text-slate-500">Variacao de preco</p>
      <p className="text-2xl font-semibold">{value.toFixed(2)}%</p>
    </div>
  );
}
