"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBasket,
  Tags,
  Ticket,
  Package,
} from "lucide-react";
import { Navigation } from "./Navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/purchases", label: "Minhas Compras", icon: ShoppingCart },
  { href: "/items", label: "Itens", icon: Package },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/marks", label: "Marcas", icon: Ticket },
  { href: "/supermarkets", label: "Supermercados", icon: ShoppingBasket },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-green-700">
          Controle de Compras
        </h1>
      </div>
      <Navigation />
    </aside>
  );
}
