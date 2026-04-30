import type { ShoppingItem } from "@/features/lists/listSlice";

export function ListBoard({ title, items }: { title: string; items: ShoppingItem[] }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id} className="rounded border p-2">
            {item.name} x{item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
