"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/AnimatedPage";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { useI18n } from "@/i18n";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Erro ao entrar" }));
        const msg = body.error || "Erro ao entrar";
        setError(msg);
        toast.error(msg);
        return;
      }

      toast.success(t("login.submit"));
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-blue-50 p-4">
      <AnimatedPage className="mx-auto flex min-h-screen w-full max-w-md items-center">
        <form className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm" onSubmit={onSubmit}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("login.title")}</h1>
              <p className="text-sm text-slate-500">{t("login.subtitle")}</p>
            </div>
            <div className="w-[135px]">
              <LanguageSwitcher compact />
            </div>
          </div>

          <AppInput placeholder={t("login.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="space-y-2">
            <AppInput placeholder={t("login.password")} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            <AppButton type="button" variant="ghost" className="px-0 py-0 text-xs text-blue-700 underline border-0 bg-transparent hover:bg-transparent" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? t("login.hidePassword") : t("login.showPassword")}
            </AppButton>
          </div>

          <Link href="/forgot-password" className="block text-right text-sm text-blue-700 underline">
            {t("login.forgot")}
          </Link>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <AppButton type="submit" className="w-full hover:-translate-y-0.5" loading={submitting} loadingText={t("login.submitting")}>{t("login.submit")}</AppButton>
          <Link href="/register" className="block text-center text-sm text-slate-600 underline">{t("login.noAccount")}</Link>
        </form>
      </AnimatedPage>
    </main>
  );
}
