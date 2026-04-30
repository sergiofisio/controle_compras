"use client";

export function AppField({ label, children, className = "" }: { label?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>}
      {children}
    </div>
  );
}
