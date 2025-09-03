// src/hooks/useMarks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listMarks, createMark, updateMark, deleteMark } from "@/lib/api";
import { NamedEntityData } from "@/backend/type/type";
import { useLoadingStore } from "@/store/loadingStore";
import { toast } from "sonner";

export function useMarks() {
  return useQuery({
    queryKey: ["marks"],
    queryFn: listMarks,
  });
}

export function useCreateMark() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();
  return useMutation({
    mutationFn: (data: NamedEntityData) => createMark(data),
    onMutate: () => {
      showLoading();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      toast.success("Marca criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar Marca", { description: error.message });
    },
    onSettled: () => {
      hideLoading();
    },
  });
}

export function useUpdateMark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { id: string; data: NamedEntityData }) =>
      updateMark(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
    },
  });
}

export function useDeleteMark() {
  const queryClient = useQueryClient();
  const { showLoading, hideLoading } = useLoadingStore();

  return useMutation({
    mutationFn: (id: string) => deleteMark(id),
    onMutate: () => showLoading(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      toast.success("Marca deletada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao deletar marca", { description: error.message });
    },
    onSettled: () => hideLoading(),
  });
}
