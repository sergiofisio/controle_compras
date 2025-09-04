"use client";

import { Navigation } from "./Navigation";

export function Sidebar() {
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
