"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  loadingText?: string;
};

const variantClass: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-slate-800 text-white hover:bg-slate-900",
  ghost: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
};

export function AppButton({ variant = "primary", className = "", type = "button", loading = false, loadingText = "Carregando...", children, disabled, ...props }: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`rounded-xl px-3 py-2.5 cursor-pointer text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}
