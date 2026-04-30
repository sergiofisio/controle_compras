"use client";

export function SimpleModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
        <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        <div className="mt-3">{children}</div>
        <div className="mt-3 flex justify-end">
          <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
