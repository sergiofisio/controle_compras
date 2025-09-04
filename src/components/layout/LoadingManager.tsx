"use client";

import { useLoadingStore } from "@/store/loadingStore";
import { useEffect } from "react";

export function LoadingManager({ isLoading }: { isLoading: boolean }) {
  const { hideLoading } = useLoadingStore();

  console.log({isLoading})

  useEffect(() => {
    if (!isLoading) {
      hideLoading();
    }
  }, [isLoading, hideLoading]);

  return null;
}