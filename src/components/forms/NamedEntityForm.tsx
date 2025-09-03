"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { namedEntitySchema } from "@/backend/lib/schemas";
import { z } from "zod";

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

type NamedEntityFormValues = z.infer<typeof namedEntitySchema>;

interface NamedEntityFormProps {
  onSubmit: (values: NamedEntityFormValues) => Promise<any> | void;
  isLoading: boolean;
  defaultValues?: Partial<NamedEntityFormValues>;
  buttonText?: string;
}

export function NamedEntityForm({
  onSubmit,
  isLoading,
  defaultValues = { name: "" },
  buttonText = "Salvar",
}: NamedEntityFormProps) {
  const form = useForm<NamedEntityFormValues>({
    resolver: zodResolver(namedEntitySchema),
    defaultValues,
  });

  const handleSubmit = async (values: NamedEntityFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : buttonText}
        </Button>
      </form>
    </Form>
  );
}
