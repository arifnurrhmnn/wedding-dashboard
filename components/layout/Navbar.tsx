"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6 sticky top-0 z-50 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8 hover:bg-muted"
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div className="flex-1">
        <h1 className="text-base font-semibold text-foreground">Dashboard</h1>
      </div>
    </header>
  );
}
