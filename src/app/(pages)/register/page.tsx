"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { registerUserSchema } from "@/backend/lib/schemas";
import { CustomFormField } from "@/components/forms/CustomFormField";

type RegisterFormValues = z.infer<typeof registerUserSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await axios.post("/api/register", data);
      toast.success("Conta criada com sucesso!", {
        description: "Você já pode fazer o login.",
      });
      router.push("/login");
    } catch (error: any) {
      toast.error("Erro no registro", {
        description:
          error.response?.data?.message || "Não foi possível criar sua conta.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>
            Comece a organizar suas compras hoje mesmo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CustomFormField
                control={form.control}
                name="name"
                label="Nome"
                placeholder="Seu nome"
              />

              <CustomFormField
                control={form.control}
                name="email"
                label="E-mail"
                placeholder="seu@email.com"
                type="email"
              />

              <CustomFormField
                control={form.control}
                name="password"
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                type="password"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Criando conta..."
                  : "Criar Conta"}
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-green-700 hover:underline"
            >
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
