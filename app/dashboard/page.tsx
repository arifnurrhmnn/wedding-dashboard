"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Gift,
  Package,
  CheckSquare,
  Calendar,
  Heart,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Mail,
  GiftIcon,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchGuests } from "@/redux/slices/guestSlice";
import { fetchChecklist } from "@/redux/slices/checklistSlice";
import { fetchSeserahan } from "@/redux/slices/seserahanSlice";
import { fetchSouvenir } from "@/redux/slices/souvenirSlice";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";

export default function DashboardHomePage() {
  const dispatch = useAppDispatch();
  const { list: guests } = useAppSelector((state) => state.guests);
  const { list: checklist, loading: checklistLoading } = useAppSelector(
    (state) => state.checklist
  );
  const { list: seserahan } = useAppSelector((state) => state.seserahan);
  const { list: souvenir } = useAppSelector((state) => state.souvenir);

  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const nama =
          user.user_metadata?.nama || user.email?.split("@")[0] || "User";
        setUserName(nama);
      }
    });

    dispatch(fetchGuests());
    dispatch(fetchChecklist());
    dispatch(fetchSeserahan());
    dispatch(fetchSouvenir());
  }, [dispatch]);

  // Guest stats
  const totalGuests = guests.length;
  const totalQty = guests.reduce((sum, g) => sum + (g.qty || 0), 0);
  const guestInvited = guests.filter((g) => g.is_invited).length;
  const guestHadir = guests.filter((g) => g.kategori === "Hadir").length;

  // Checklist stats
  const totalTasks = checklist.length;
  const doneTasks = checklist.filter((t) => t.status === "done").length;
  const inProgressTasks = checklist.filter(
    (t) => t.status === "in_progress"
  ).length;
  const checklistProgress =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Seserahan stats
  const totalSeserahan = seserahan.length;
  const seserahanBought = seserahan.filter(
    (s) => s.status_pembelian === "Sudah Dibeli"
  ).length;
  const totalSeserahanBudget = seserahan.reduce(
    (sum, s) => sum + (s.harga || 0),
    0
  );

  // Souvenir stats
  const totalSouvenir = souvenir.length;
  const souvenirBought = souvenir.filter(
    (s) => s.status_pengadaan === "Sudah Dibeli"
  ).length;
  const totalSouvenirBudget = souvenir.reduce(
    (sum, s) => sum + (s.total_harga || 0),
    0
  );

  const totalBudget = totalSeserahanBudget + totalSouvenirBudget;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  // Get upcoming/in-progress checklist tasks
  const upcomingTasks = checklist
    .filter((t) => t.status !== "done")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-primary/90 to-primary rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 fill-white text-white" />
            <span className="text-white/80 text-sm font-medium">
              Wedding Dashboard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            Selamat Datang, {userName}! 👋
          </h1>
          <p className="text-white/75 text-sm md:text-base">
            Semua persiapan pernikahanmu ada di sini. Yuk, mulai rencanakan hari
            spesialmu!
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -right-4 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-4 right-24 w-8 h-8 bg-white/10 rounded-full" />
      </div>

      {/* Overview Stats */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Ringkasan
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tamu */}
          <Link href="/dashboard/tamu-undangan" className="group">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Tamu
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {totalGuests}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalQty} undangan
                  </p>
                </div>
                <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </div>
          </Link>

          {/* Checklist Progress */}
          <Link href="/dashboard/checklist" className="group">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Checklist
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {checklistProgress}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {doneTasks}/{totalTasks} selesai
                  </p>
                </div>
                <div className="p-2.5 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                </div>
              </div>
              {/* Mini progress bar */}
              {totalTasks > 0 && (
                <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>
              )}
            </div>
          </Link>

          {/* Seserahan */}
          <Link href="/dashboard/seserahan" className="group">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Seserahan
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {totalSeserahan}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {seserahanBought} sudah dibeli
                  </p>
                </div>
                <div className="p-2.5 bg-rose-500/10 rounded-lg group-hover:bg-rose-500/20 transition-colors">
                  <Gift className="h-5 w-5 text-rose-500" />
                </div>
              </div>
            </div>
          </Link>

          {/* Souvenir */}
          <Link href="/dashboard/souvenir" className="group">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Souvenir
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {totalSouvenir}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {souvenirBought} sudah dibeli
                  </p>
                </div>
                <div className="p-2.5 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Package className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Budget Summary + Checklist Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Ringkasan Budget
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-rose-500" />
                <span className="text-sm text-muted-foreground">Seserahan</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(totalSeserahanBudget)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Souvenir</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(totalSouvenirBudget)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Total
                </span>
              </div>
              <span className="text-base font-bold text-primary">
                {formatCurrency(totalBudget)}
              </span>
            </div>
          </div>
        </div>

        {/* Checklist Progress Detail */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            Progress Checklist
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Keseluruhan
              </span>
              <span className="text-sm font-bold text-primary">
                {checklistProgress}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-muted-foreground">
                  {checklist.filter((t) => t.status === "todo").length}
                </p>
                <p className="text-xs text-muted-foreground">To Do</p>
              </div>
              <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                <p className="text-lg font-bold text-yellow-500">
                  {inProgressTasks}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="text-center p-2 bg-green-500/10 rounded-lg">
                <p className="text-lg font-bold text-green-500">{doneTasks}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Task Belum Selesai
            </h3>
            <Link href="/dashboard/checklist">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 gap-1 h-7 text-xs"
              >
                Lihat Semua
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {checklistLoading && checklist.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-green-500/10 rounded-full mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Semua task selesai!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalTasks === 0
                  ? "Belum ada task yang dibuat"
                  : "Luar biasa, semua persiapan beres!"}
              </p>
              {totalTasks === 0 && (
                <Link href="/dashboard/checklist" className="mt-3">
                  <Button
                    size="sm"
                    className="gap-2 text-xs bg-primary hover:bg-primary/90 text-white"
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate Template
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <div
                    className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                      task.status === "in_progress"
                        ? "bg-yellow-500"
                        : "bg-muted-foreground/40"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.category} ·{" "}
                      <span
                        className={
                          task.priority === "high"
                            ? "text-red-500"
                            : task.priority === "medium"
                            ? "text-yellow-500"
                            : "text-muted-foreground"
                        }
                      >
                        {task.priority === "high"
                          ? "Prioritas Tinggi"
                          : task.priority === "medium"
                          ? "Prioritas Sedang"
                          : "Prioritas Rendah"}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Navigasi Cepat
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/tamu-undangan">
              <div className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors cursor-pointer group">
                <Users className="h-6 w-6 text-blue-500" />
                <span className="text-xs font-medium text-foreground text-center">
                  Daftar Tamu
                </span>
              </div>
            </Link>
            <Link href="/dashboard/undangan-tamu">
              <div className="flex flex-col items-center gap-2 p-4 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-colors cursor-pointer group">
                <Mail className="h-6 w-6 text-indigo-500" />
                <span className="text-xs font-medium text-foreground text-center">
                  Undangan
                </span>
              </div>
            </Link>
            <Link href="/dashboard/checklist">
              <div className="flex flex-col items-center gap-2 p-4 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-colors cursor-pointer group">
                <CheckSquare className="h-6 w-6 text-green-500" />
                <span className="text-xs font-medium text-foreground text-center">
                  Checklist
                </span>
              </div>
            </Link>
            <Link href="/dashboard/seserahan">
              <div className="flex flex-col items-center gap-2 p-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer group">
                <Gift className="h-6 w-6 text-rose-500" />
                <span className="text-xs font-medium text-foreground text-center">
                  Seserahan
                </span>
              </div>
            </Link>
            <Link href="/dashboard/souvenir">
              <div className="flex flex-col items-center gap-2 p-4 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-colors cursor-pointer group">
                <Package className="h-6 w-6 text-purple-500" />
                <span className="text-xs font-medium text-foreground text-center">
                  Souvenir
                </span>
              </div>
            </Link>
            <Link href="/dashboard/gift-tamu">
              <div className="flex flex-col items-center gap-2 p-4 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-xl transition-colors cursor-pointer group">
                <GiftIcon className="h-6 w-6 text-yellow-500" />
                <span className="text-xs font-medium text-foreground text-center">
                  Gift Tamu
                </span>
              </div>
            </Link>
            <Link href="/dashboard/kalender">
              <div className="flex flex-col items-center gap-2 p-4 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl transition-colors cursor-pointer group">
                <Calendar className="h-6 w-6 text-orange-500" />
                <span className="text-xs font-medium text-foreground text-center">
                  Kalender
                </span>
              </div>
            </Link>
            <Link href="/dashboard/planning">
              <div className="flex flex-col items-center gap-2 p-4 bg-teal-500/10 hover:bg-teal-500/20 rounded-xl transition-colors cursor-pointer group">
                <Sparkles className="h-6 w-6 text-teal-500" />
                <span className="text-xs font-medium text-foreground text-center">
                  Planning
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Guest Status Detail */}
      {totalGuests > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Statistik Tamu
            </h3>
            <Link href="/dashboard/tamu-undangan">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 gap-1 h-7 text-xs"
              >
                Kelola Tamu
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-500/10 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">{totalGuests}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total Tamu
              </p>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalQty}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Total Undangan
              </p>
            </div>
            <div className="text-center p-3 bg-indigo-500/10 rounded-lg">
              <p className="text-2xl font-bold text-indigo-500">
                {guestInvited}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sudah Diundang
              </p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{guestHadir}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Konfirmasi Hadir
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
