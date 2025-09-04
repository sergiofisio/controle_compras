"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Ticket,
  ShoppingBasket,
} from "lucide-react";
import { NavLink } from "./NavLink";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/purchases", label: "Minhas Compras", icon: ShoppingCart },
  { href: "/items", label: "Itens", icon: Package },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/marks", label: "Marcas", icon: Ticket },
  { href: "/supermarkets", label: "Supermercados", icon: ShoppingBasket },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <NavLink
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-200",
              isActive && "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
