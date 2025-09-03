"use client";

import { useLoadingStore } from "@/store/loadingStore";
import { LoaderCircle } from "lucide-react";

export function LoadingOverlay() {
  const { isLoading } = useLoadingStore();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 text-white">
        <LoaderCircle className="h-12 w-12 animate-spin" />
        <p className="text-lg">Carregando...</p>
      </div>
    </div>
  );
}
