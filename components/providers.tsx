"use client";

import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { makeStore, type AppStore } from "@/redux/store";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [scope, setScope] = useState<{ userId: string | null; store: AppStore } | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;
      // Each account receives a separate store. Old in-flight requests retain
      // only the old store and cannot publish data into the next account.
      setScope((current) => current?.userId === userId
        ? current
        : { userId, store: makeStore() });
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!scope) {
    return <div className="flex min-h-screen items-center justify-center" role="status">Memuat sesi...</div>;
  }

  return (
    <Provider key={scope.userId ?? "anonymous"} store={scope.store}>
      {children}
      <Toaster position="top-center" richColors />
    </Provider>
  );
}
