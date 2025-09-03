"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";
import { NamedEntityData } from "@/backend/type/type";
import { useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();
  return useMutation({
    mutationFn: (data: NamedEntityData) => createCategory(data),
    onMutate: () => {
      showLoading();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar categoria", { description: error.message });
    },
    onSettled: () => {
      hideLoading();
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; data: NamedEntityData }) =>
      updateCategory(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onMutate: () => showLoading(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria deletada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar categoria", { description: error.message });
    },
    onSettled: () => hideLoading(),
  });
}
