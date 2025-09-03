"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createItemSchema } from "@/backend/lib/schemas";
import { z } from "zod";
import { toast } from "sonner";

import { useCategories, useCreateCategory } from "@/hooks/useCategories";
import { useMarks, useCreateMark } from "@/hooks/useMarks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NamedEntityForm } from "./NamedEntityForm";
import { PlusCircle } from "lucide-react";

type ItemFormValues = z.infer<typeof createItemSchema>;

interface ItemFormProps {
  onSubmit: (values: ItemFormValues) => void;
  isLoading: boolean;
  defaultValues?: Partial<ItemFormValues>;
}

export function ItemForm({
  onSubmit,
  isLoading,
  defaultValues,
}: ItemFormProps) {
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: marks, isLoading: isLoadingMarks } = useMarks();

  const createCategory = useCreateCategory();
  const createMark = useCreateMark();

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(createItemSchema),
    defaultValues: defaultValues || {
      name: "",
      categoryId: "",
      markId: "",
    },
  });

  const handleCreateCategory = async (values: { name: string }) => {
    createCategory.mutate(values, {
      onSuccess: (newCategory) => {
        toast.success(`Categoria "${newCategory.name}" criada com sucesso!`);
        setIsCategoryDialogOpen(false);
        form.setValue("categoryId", newCategory.id);
      },
      onError: (error) =>
        toast.error("Erro ao criar categoria", { description: error.message }),
    });
  };

  const handleCreateMark = async (values: { name: string }) => {
    createMark.mutate(values, {
      onSuccess: (newMark) => {
        toast.success(`Marca "${newMark.name}" criada com sucesso!`);
        setIsMarkDialogOpen(false);
        form.setValue("markId", newMark.id);
      },
      onError: (error) =>
        toast.error("Erro ao criar marca", { description: error.message }),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Item</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Leite Integral" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-1">
                <FormLabel>Categoria</FormLabel>
                <Dialog
                  open={isCategoryDialogOpen}
                  onOpenChange={setIsCategoryDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 cursor-pointer"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Nova
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <NamedEntityForm
                      onSubmit={handleCreateCategory}
                      isLoading={createCategory.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
                disabled={isLoadingCategories}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="markId"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-1">
                <FormLabel>Marca</FormLabel>
                <Dialog
                  open={isMarkDialogOpen}
                  onOpenChange={setIsMarkDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 cursor-pointer"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Nova
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Marca</DialogTitle>
                    </DialogHeader>
                    <NamedEntityForm
                      onSubmit={handleCreateMark}
                      isLoading={createMark.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
                disabled={isLoadingMarks}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma marca..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {marks?.map((mark) => (
                    <SelectItem key={mark.id} value={mark.id}>
                      {mark.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full ">
          {isLoading ? "Salvando..." : "Salvar Item"}
        </Button>
      </form>
    </Form>
  );
}
