"use client";

import { useSyncExternalStore } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

const preferenceEvent = "sidebar-preference-changed";
let fallbackMinimized = false;
function readPreference() {
  try {
    return localStorage.getItem("sidebarMinimized") === "true";
  } catch {
    return fallbackMinimized;
  }
}
function subscribeToPreference(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(preferenceEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(preferenceEvent, callback);
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMinimized = useSyncExternalStore(subscribeToPreference, readPreference, () => false);

  const toggleSidebar = () => {
    const newState = !isMinimized;
    fallbackMinimized = newState;
    try { localStorage.setItem("sidebarMinimized", String(newState)); } catch { /* Storage may be disabled. */ }
    window.dispatchEvent(new Event(preferenceEvent));
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
