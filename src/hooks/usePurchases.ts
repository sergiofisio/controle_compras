// src/hooks/usePurchases.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
} from "@/lib/api";
import { PurchaseCreateData } from "@/backend/type/type";
import { useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function usePurchases() {
  const { status } = useSession();
  return useQuery({
    queryKey: ["purchases"],
    queryFn: listPurchases,
    enabled: status === "authenticated",
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ["purchase", id],
    queryFn: () => getPurchaseById(id),
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();

  return useMutation({
    mutationFn: (data: PurchaseCreateData) => createPurchase(data),
    onMutate: () => {
      showLoading();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Compra criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar compra", { description: error.message });
    },
    onSettled: () => {
      hideLoading();
    },
  });
}

export function useDeletePurchase() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();

  return useMutation({
    mutationFn: (id: string) => deletePurchase(id),
    onMutate: () => showLoading(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      toast.success("Compra deletada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar compra", { description: error.message });
    },
    onSettled: () => {
      hideLoading();
    },
  });
}
