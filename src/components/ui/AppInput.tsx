"use client";

import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function AppInput({ className = "", ...props }: Props) {
  return <input className={`w-full rounded-xl border border-slate-200 p-2.5 transition-colors focus:border-blue-400 focus:outline-none ${className}`} {...props} />;
}
