"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(() => {
    // Initialize from localStorage on mount
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebarMinimized") === "true";
    }
    return false;
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/login");
    }
  }, [router]);

  const toggleSidebar = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    localStorage.setItem("sidebarMinimized", newState.toString());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Always visible with smooth transition */}
      <aside
        className={`transition-all duration-300 ease-in-out ${
          isMinimized ? "w-16" : "w-72"
        }`}
      >
        <Sidebar isMinimized={isMinimized} onToggle={toggleSidebar} />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
