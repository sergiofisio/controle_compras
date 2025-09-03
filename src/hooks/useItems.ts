"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listItems, createItem, updateItem, deleteItem } from "@/lib/api";
import { ItemCreateData } from "@/backend/type/type";
import { useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: listItems,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();
  return useMutation({
    mutationFn: (data: ItemCreateData) => createItem(data),
    onMutate: () => {
      showLoading();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error) => {
      toast.error("Erro ao criar Item", { description: error.message });
    },
    onSettled: () => {
      hideLoading();
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; data: Partial<ItemCreateData> }) =>
      updateItem(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onMutate: () => showLoading(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deletado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar Item", { description: error.message });
    },
    onSettled: () => hideLoading(),
  });
}
