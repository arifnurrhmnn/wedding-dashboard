"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (isLoggedIn === "true") {
          router.replace("/dashboard/tamu-undangan");
        } else {
          router.replace("/login");
        }
      } catch {
        // If localStorage is not available, redirect to login
        router.replace("/login");
      } finally {
        setIsChecking(false);
      }
    };

    // Small delay to ensure client-side hydration
    const timeout = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeout);
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p className="mt-4 text-muted-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
