"use client";

import { cn } from "@/lib/utils";
import {
  Users,
  LogOut,
  Heart,
  Gift,
  Package,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const menuItems = [
  {
    title: "Kalender",
    href: "/dashboard/kalender",
    icon: Calendar,
  },
  {
    title: "Tamu Undangan",
    href: "/dashboard/tamu-undangan",
    icon: Users,
  },
  {
    title: "Seserahan",
    href: "/dashboard/seserahan",
    icon: Gift,
  },
  {
    title: "Souvenir",
    href: "/dashboard/souvenir",
    icon: Package,
  },
];

const weddingPlanGroup = {
  title: "Wedding Plan",
  icon: Heart,
  submenus: [
    {
      title: "Planning",
      href: "/dashboard/planning",
      icon: CheckSquare,
    },
    {
      title: "Checklist",
      href: "/dashboard/checklist",
      icon: CheckSquare,
    },
  ],
};

function WeddingPlanGroup({ pathname }: { pathname: string }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const GroupIcon = weddingPlanGroup.icon;
  const isAnySubmenuActive = weddingPlanGroup.submenus.some(
    (submenu) => pathname === submenu.href
  );

  return (
    <div className="space-y-1">
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isAnySubmenuActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <GroupIcon className="h-4 w-4" />
        <span className="flex-1 text-left">{weddingPlanGroup.title}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {/* Submenus */}
      {isExpanded && (
        <div className="ml-4 space-y-1 border-l-2 border-border pl-3">
          {weddingPlanGroup.submenus.map((submenu) => {
            const SubmenuIcon = submenu.icon;
            const isActive = pathname === submenu.href;
            return (
              <Link
                key={submenu.href}
                href={submenu.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <SubmenuIcon className="h-4 w-4" />
                {submenu.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    toast.success("Logout berhasil");
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Brand Section */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link
          href="/dashboard/tamu-undangan"
          className="flex items-center gap-3 font-semibold group"
        >
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-foreground text-base font-bold">
            Wedding Dashboard
          </span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Admin
            </p>
            <p className="text-xs text-muted-foreground truncate">
              admin@wedding.com
            </p>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-3">
          {/* Regular Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}

          {/* Wedding Plan Group */}
          <WeddingPlanGroup pathname={pathname} />
        </nav>
      </div>

      {/* Logout Section */}
      <div className="mt-auto p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 text-muted-foreground hover:bg-muted/50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
