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
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

function WeddingPlanGroup({
  pathname,
  isMinimized,
}: {
  pathname: string;
  isMinimized: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const GroupIcon = weddingPlanGroup.icon;
  const isAnySubmenuActive = weddingPlanGroup.submenus.some(
    (submenu) => pathname === submenu.href
  );

  if (isMinimized) {
    // Show dropdown menu with submenus when minimized
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-center rounded-lg p-2.5 transition-all duration-150",
              isAnySubmenuActive
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <GroupIcon className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-48">
          {weddingPlanGroup.submenus.map((submenu) => {
            const SubmenuIcon = submenu.icon;
            const isActive = pathname === submenu.href;
            return (
              <DropdownMenuItem key={submenu.href} asChild>
                <Link
                  href={submenu.href}
                  className={cn(
                    "flex items-center gap-3 w-full cursor-pointer",
                    isActive && "bg-primary/10 text-primary"
                  )}
                >
                  <SubmenuIcon className="h-4 w-4" />
                  {submenu.title}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

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

interface SidebarProps {
  isMinimized: boolean;
  onToggle: () => void;
}

export function Sidebar({ isMinimized, onToggle }: SidebarProps) {
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
      <div className="flex h-16 items-center border-b border-border px-3 justify-between">
        {isMinimized ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/tamu-undangan"
                  className="flex items-center justify-center w-full group"
                >
                  <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                    <Heart className="h-5 w-5 text-white fill-white" />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                <p>Wedding Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <Link
              href="/dashboard/tamu-undangan"
              className="flex items-center gap-3 font-semibold group"
            >
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="text-foreground text-base font-bold truncate">
                Wedding
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onToggle}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Toggle Button for Minimized State */}
      {isMinimized && (
        <div className="px-3 py-2 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-full"
            onClick={onToggle}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* User Profile Section */}
      {!isMinimized && (
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
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
      )}

      {/* Menu Section */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-3">
          {/* Regular Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (isMinimized) {
              return (
                <TooltipProvider key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center rounded-lg p-2.5 transition-all duration-150",
                          isActive
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

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
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}

          {/* Wedding Plan Group */}
          <WeddingPlanGroup pathname={pathname} isMinimized={isMinimized} />
        </nav>
      </div>

      {/* Logout Section */}
      <div className="mt-auto p-4 border-t border-border">
        {isMinimized ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full h-10 text-muted-foreground hover:bg-muted/50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-10 text-muted-foreground hover:bg-muted/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="truncate">Logout</span>
          </Button>
        )}
      </div>
    </div>
  );
}
