"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Navigation } from "./Navigation";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu de navegação</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="p-4 border-b -mt-4">
            <h1 className="text-xl font-bold text-green-700">
              Controle de Compras
            </h1>
          </div>
          <Navigation />
        </SheetContent>
      </Sheet>
      <div className="flex-1"></div>
    </header>
  );
}
