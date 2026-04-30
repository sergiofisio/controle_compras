"use client";

import type { Family } from "@/hooks/useFamilies";
import { AppSelect } from "@/components/ui/AppSelect";
import { useI18n } from "@/i18n";

export function ContextHeader({ title, subtitle, familyId, families, setFamilyId, email }: { title: string; subtitle: string; familyId: string; families: Family[]; setFamilyId: (id: string) => void; email: string }) {
  const { t } = useI18n();
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{t("header.activeFamily")}</label>
          <AppSelect value={familyId} onChange={(e) => setFamilyId(e.target.value)}>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </AppSelect>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-700">{t("header.currentSession")}</p>
          <p>{email || "-"}</p>
        </div>
      </div>
    </header>
  );
}
