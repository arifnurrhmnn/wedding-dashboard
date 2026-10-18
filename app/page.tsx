"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function Home() {
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        window.location.replace("/dashboard");
      } else {
        window.location.replace("/login");
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="mt-4 text-muted-foreground text-lg">Loading...</p>
      </div>
    </div>
  );
}
