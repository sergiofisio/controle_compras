"use client";

import Link from "next/link";
import { AnimatedPage } from "@/components/AnimatedPage";
import { useI18n } from "@/i18n";

export default function HomePage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-blue-50 px-6 py-10">
      <AnimatedPage className="mx-auto flex min-h-[80vh] w-full max-w-4xl flex-col items-center justify-center gap-7 text-center">
        <span className="rounded-full border border-blue-200 bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          {t("home.badge")}
        </span>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">{t("home.title")}</h1>
        <p className="max-w-2xl text-base text-slate-600 md:text-lg">
          {t("home.subtitle")}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow"
            href="/login"
          >
            {t("home.login")}
          </Link>
          <Link
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"
            href="/register"
          >
            {t("home.register")}
          </Link>
        </div>
      </AnimatedPage>
    </main>
  );
}
