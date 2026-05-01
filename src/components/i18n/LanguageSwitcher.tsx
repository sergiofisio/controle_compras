"use client";

import { AppSelect } from "@/components/ui/AppSelect";
import { useI18n } from "@/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  return (
    <div className={compact ? "" : "space-y-1"}>
      {!compact ? <p className="text-xs text-slate-500">{t("common.language")}</p> : null}
      <AppSelect value={language} onChange={(e) => setLanguage(e.target.value as "pt" | "en" | "es" | "fr")}>
        <option value="pt">{t("lang.pt")}</option>
        <option value="en">{t("lang.en")}</option>
        <option value="es">{t("lang.es")}</option>
        <option value="fr">{t("lang.fr")}</option>
      </AppSelect>
    </div>
  );
}
