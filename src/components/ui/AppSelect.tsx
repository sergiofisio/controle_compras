"use client";

import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export function AppSelect({ className = "", ...props }: Props) {
  return <select className={`w-full rounded-xl border border-slate-200 p-2.5 focus:border-blue-400 focus:outline-none ${className}`} {...props} />;
}
