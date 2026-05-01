"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "./types";
import { dictionaries } from "./dictionaries";

export type { Lang } from "./types";

function persistLangCookie(lang: Lang) {
  if (typeof document === "undefined") return;
  document.cookie = `app_lang=${lang};path=/;max-age=31536000;SameSite=Lax`;
}

type I18nValue = {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Lang>("pt");

  useEffect(() => {
    const saved = window.localStorage.getItem("app_lang");
    if (saved === "pt" || saved === "en" || saved === "es" || saved === "fr") {
      setLanguageState(saved);
      persistLangCookie(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("app_lang", language);
    persistLangCookie(language);
  }, [language]);

  const setLanguage = (lang: Lang) => setLanguageState(lang);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t: (key: string, fallback = key) => dictionaries[language][key] ?? dictionaries.pt[key] ?? fallback,
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
