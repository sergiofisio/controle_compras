// src/app/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CustomFormField } from "@/components/forms/CustomFormField";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é Obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Falha no login", {
        description:
          "Credenciais inválidas. Por favor, verifique seu e-mail e senha.",
      });
    } else {
      setTimeout(() => {
        toast.success("Login bem sucedido! Redirecionando...");
      }, 5000);
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar suas compras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
                type="password"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-green-700 hover:underline"
            >
              Registre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
