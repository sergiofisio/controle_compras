import type { Lang } from "./types";
import { pt } from "./messages/pt";
import { en } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";

export type { Lang };

export const dictionaries: Record<Lang, Record<string, string>> = {
  pt,
  en,
  es,
  fr,
};

export function translate(lang: Lang, key: string, fallback?: string): string {
  return dictionaries[lang][key] ?? dictionaries.pt[key] ?? fallback ?? key;
}
