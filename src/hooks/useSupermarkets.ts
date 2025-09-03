"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSupermarkets,
  createSupermarket,
  updateSupermarket,
  deleteSupermarket,
} from "@/lib/api";
import { NamedEntityData } from "@/backend/type/type";
import { useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";

export function useSupermarkets() {
  return useQuery({
    queryKey: ["supermarkets"],
    queryFn: listSupermarkets,
  });
}

export function useCreateSupermarket() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();
  return useMutation({
    mutationFn: (data: NamedEntityData) => createSupermarket(data),
    onMutate: () => {
      showLoading();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supermarkets"] });
      toast.success("Suupermercado criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar Suupermercado", {
        description: error.message,
      });
    },
    onSettled: () => {
      hideLoading();
    },
  });
}

export function useUpdateSupermarket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; data: NamedEntityData }) =>
      updateSupermarket(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supermarkets"] });
    },
  });
}

export function useDeleteSupermarket() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();

  return useMutation({
    mutationFn: (id: string) => deleteSupermarket(id),
    onMutate: () => showLoading(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supermarkets"] });
      toast.success("Suupermercado deletado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar Suupermercado", {
        description: error.message,
      });
    },
    onSettled: () => hideLoading(),
  });
}
