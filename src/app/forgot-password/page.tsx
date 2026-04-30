"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useI18n } from "@/i18n";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setResetLink("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const body = await res.json();
    setMessage(body.message || body.error || "Solicitacao processada");
    if (body.resetLink) setResetLink(body.resetLink);
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-blue-50 p-4">
      <AnimatedPage className="mx-auto flex min-h-screen w-full max-w-md items-center">
        <form className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm" onSubmit={onSubmit}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("forgot.title")}</h1>
              <p className="text-sm text-slate-600">{t("forgot.subtitle")}</p>
            </div>
            <div className="w-[135px]">
              <LanguageSwitcher compact />
            </div>
          </div>
          <AppInput placeholder={t("login.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
          {message && <p className="text-sm text-slate-700">{message}</p>}
          {resetLink && (
            <p className="break-all rounded-xl bg-slate-100 p-3 text-xs">
              {t("forgot.localLink")} <a className="text-blue-700 underline" href={resetLink}>{resetLink}</a>
            </p>
          )}
          <AppButton className="w-full" type="submit">{t("forgot.submit")}</AppButton>
          <Link href="/login" className="block text-center text-sm text-blue-700 underline">{t("forgot.backLogin")}</Link>
        </form>
      </AnimatedPage>
    </main>
  );
}
