"use client";

import { useMemo } from "react";
import {
  BudgetSettings,
  BudgetCategory,
  BudgetItem,
} from "@/redux/slices/budgetSlice";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
} from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
  }).format(n);

const fmtFull = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

interface BudgetHeroProps {
  settings: BudgetSettings | null;
  categories: BudgetCategory[];
  items: BudgetItem[];
  autoLinkedEstimasi?: number;
  autoLinkedRealisasi?: number;
  onSetBudget: () => void;
}

export function BudgetHero({
  settings,
  items,
  autoLinkedEstimasi = 0,
  autoLinkedRealisasi = 0,
  onSetBudget,
}: BudgetHeroProps) {
  const totalBudget = settings?.total_budget ?? 0;

  const {
    totalEstimasi,
    totalRealisasi,
    sisaBudget,
    persen,
    isOverEstimasi,
    isOverRealisasi,
  } = useMemo(() => {
    const est =
      items.reduce((s, i) => s + (i.estimasi || 0), 0) + autoLinkedEstimasi;
    const real =
      items.reduce((s, i) => s + (i.realisasi || 0), 0) + autoLinkedRealisasi;
    const sisa = totalBudget - real;
    const pct =
      totalBudget > 0
        ? Math.min(Math.round((real / totalBudget) * 100), 100)
        : 0;
    return {
      totalEstimasi: est,
      totalRealisasi: real,
      sisaBudget: sisa,
      persen: pct,
      isOverEstimasi: totalBudget > 0 && est > totalBudget,
      isOverRealisasi: totalBudget > 0 && real > totalBudget,
    };
  }, [items, totalBudget, autoLinkedEstimasi, autoLinkedRealisasi]);

  const isLowBudget =
    totalBudget > 0 && sisaBudget < totalBudget * 0.1 && !isOverRealisasi;

  return (
    <div className="space-y-4">
      {/* Over budget banners */}
      {isOverRealisasi && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm font-semibold text-destructive">
            ⚠️ Realisasi pengeluaran sudah melebihi total budget!
          </p>
        </div>
      )}
      {!isOverRealisasi && isOverEstimasi && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <p className="text-sm font-semibold text-yellow-500">
            ⚠️ Total estimasi melebihi budget yang ditetapkan — sebaiknya
            kurangi beberapa item.
          </p>
        </div>
      )}
      {isLowBudget && (
        <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <p className="text-sm font-semibold text-yellow-500">
            ⚠️ Sisa budget sudah di bawah 10% — hati-hati pengeluaran
            selanjutnya.
          </p>
        </div>
      )}

      {/* Hero card */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Budget Pernikahan
            </p>
            {totalBudget > 0 ? (
              <p className="text-3xl font-bold text-foreground mt-0.5">
                {fmtFull(totalBudget)}
              </p>
            ) : (
              <p className="text-xl font-semibold text-muted-foreground italic mt-0.5">
                Belum ditetapkan
              </p>
            )}
            {settings?.catatan && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {settings.catatan}
              </p>
            )}
          </div>
          <button
            onClick={onSetBudget}
            className="text-xs text-primary hover:underline shrink-0 mt-1"
          >
            {totalBudget > 0 ? "Ubah budget" : "Set budget →"}
          </button>
        </div>

        {/* Progress bar */}
        {totalBudget > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Realisasi: {fmt(totalRealisasi)}</span>
              <span
                className={isOverRealisasi ? "text-destructive font-bold" : ""}
              >
                {persen}% terpakai
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  isOverRealisasi
                    ? "bg-destructive"
                    : persen >= 75
                    ? "bg-yellow-500"
                    : "bg-primary"
                }`}
                style={{ width: `${persen}%` }}
              />
            </div>
          </div>
        )}

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <StatCard
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            bg="bg-primary/10"
            label="Total Budget"
            value={fmt(totalBudget)}
            sub={totalBudget === 0 ? "Belum diset" : undefined}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
            bg="bg-blue-500/10"
            label="Total Estimasi"
            value={fmt(totalEstimasi)}
            sub={
              autoLinkedEstimasi > 0
                ? `Incl. ${fmt(
                    autoLinkedEstimasi
                  )} auto dari seserahan/souvenir`
                : undefined
            }
            warn={isOverEstimasi}
          />
          <StatCard
            icon={<Wallet className="h-5 w-5 text-green-400" />}
            bg="bg-green-500/10"
            label="Sudah Dibayar"
            value={fmt(totalRealisasi)}
            sub={
              autoLinkedRealisasi > 0
                ? `Incl. ${fmt(
                    autoLinkedRealisasi
                  )} sudah dibeli dari seserahan/souvenir`
                : undefined
            }
          />
          <StatCard
            icon={<TrendingDown className="h-5 w-5 text-orange-400" />}
            bg="bg-orange-500/10"
            label="Sisa Budget"
            value={fmt(Math.max(sisaBudget, 0))}
            warn={isOverRealisasi || isLowBudget}
            danger={isOverRealisasi}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  bg,
  label,
  value,
  sub,
  warn,
  danger,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`bg-card border rounded-lg p-3 ${
        warn
          ? danger
            ? "border-destructive/40"
            : "border-yellow-500/30"
          : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className={`p-1.5 rounded-md ${bg}`}>{icon}</div>
      </div>
      <p
        className={`text-lg font-bold ${
          danger
            ? "text-destructive"
            : warn
            ? "text-yellow-500"
            : "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground italic">{sub}</p>}
    </div>
  );
}
