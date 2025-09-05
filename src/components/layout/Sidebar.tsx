"use client";
import { Navigation } from "./Navigation";
import Image from "next/image";

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-50 border-r">
      <div className="flex flex-col items-center justify-center gap-4 p-4">
        <Image
          width={0}
          height={0}
          sizes="100vw"
          src="/logo.svg"
          alt="Logo"
          className="h-20 w-auto"
        />
        <h2 className="uppercase font-bold">Controle de compras</h2>
      </div>
      <Navigation />
    </aside>
  );
}
