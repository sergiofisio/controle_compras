"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/features/store";
import { AppToaster } from "@/components/ui/AppToaster";
import { GlobalLoadingIndicator } from "@/components/ui/GlobalLoadingIndicator";
import { I18nProvider } from "@/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      setPendingCount((current) => current + 1);
      try {
        return await originalFetch(...args);
      } finally {
        setPendingCount((current) => Math.max(0, current - 1));
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <I18nProvider>
      <Provider store={store}>
        {children}
        <GlobalLoadingIndicator isLoading={pendingCount > 0} />
        <AppToaster />
      </Provider>
    </I18nProvider>
  );
}
