"use client";

import Link from "next/link";
import { AppButton } from "@/components/ui/AppButton";
import { useI18n } from "@/i18n";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

type Tab = "overview" | "lists" | "purchase";

export function SidebarNav({ userName, activeTab, onTabChange, onLogout, isAdmin = false, isLoggingOut = false }: { userName: string; activeTab: Tab; onTabChange: (tab: Tab) => void; onLogout: () => void; isAdmin?: boolean; isLoggingOut?: boolean }) {
  const { t } = useI18n();
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:sticky md:top-6 md:h-fit">
      <h2 className="text-lg font-bold text-slate-900">Controle Compras</h2>
      <p className="mt-1 text-xs text-slate-500">{userName || t("common.user")}</p>

      <nav className="mt-4 space-y-2">
        {(["overview", "lists", "purchase"] as Tab[]).map((tab) => (
          <AppButton key={tab} type="button" onClick={() => onTabChange(tab)} variant={activeTab === tab ? "primary" : "ghost"} className="w-full text-left">
            {tab === "overview" ? t("nav.overview") : tab === "lists" ? t("nav.lists") : t("nav.purchases")}
          </AppButton>
        ))}
      </nav>

      <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
        {isAdmin && (
          <Link href="/admin" className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700">
            Admin
          </Link>
        )}
        <Link href="/profile" className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700">
          {t("nav.profile")}
        </Link>
        <AppButton type="button" variant="secondary" className="w-full" onClick={onLogout} loading={isLoggingOut} loadingText={t("nav.loggingOut")}>{t("nav.logout")}</AppButton>
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
