"use client";

export function GlobalLoadingIndicator({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999]">
      <div className="bg-blue-600 px-3 py-1 text-center text-xs font-semibold text-white">Carregando...</div>
      <div className="h-1 w-full overflow-hidden bg-blue-100">
        <div className="global-loading-progress h-full w-1/3 bg-blue-600" />
      </div>
    </div>
  );
}
