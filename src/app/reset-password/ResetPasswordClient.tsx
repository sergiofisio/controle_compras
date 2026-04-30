"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/i18n";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export function ResetPasswordClient({ token }: { token: string }) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Token ausente.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no minimo 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas nao conferem.");
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    const body = await res.json();
    if (!res.ok) {
      setError(body.error || "Falha ao redefinir senha");
      return;
    }

    setMessage("Senha redefinida com sucesso. Voce ja pode entrar.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center p-4">
      <form className="w-full space-y-3 rounded bg-white p-6 shadow" onSubmit={onSubmit}>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-semibold">{t("reset.title")}</h1>
          <div className="w-[135px]">
            <LanguageSwitcher compact />
          </div>
        </div>
        <input className="w-full rounded border p-2" type={showPassword ? "text" : "password"} placeholder={t("reset.newPassword")} value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="w-full rounded border p-2" type={showPassword ? "text" : "password"} placeholder={t("reset.confirmPassword")} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button type="button" className="text-xs text-blue-700 underline" onClick={() => setShowPassword((v) => !v)}>
          {showPassword ? t("reset.hidePassword") : t("reset.showPassword")}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button className="w-full rounded bg-blue-600 p-2 text-white">{t("reset.submit")}</button>
        <Link href="/login" className="block text-center text-sm text-blue-700 underline">{t("reset.gotoLogin")}</Link>
      </form>
    </main>
  );
}
