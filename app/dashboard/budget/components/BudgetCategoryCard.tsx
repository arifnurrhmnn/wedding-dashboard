"use client";

import { useState, useMemo } from "react";
import { BudgetCategory, BudgetItem } from "@/redux/slices/budgetSlice";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const fmtCompact = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    notation: "compact",
  }).format(n);

const STATUS_CONFIG = {
  belum_bayar: {
    label: "⏳ Belum Bayar",
    className: "bg-muted text-muted-foreground",
  },
  dp: { label: "💳 DP", className: "bg-yellow-500/20 text-yellow-400" },
  lunas: { label: "✅ Lunas", className: "bg-green-500/20 text-green-400" },
};

interface BudgetCategoryCardProps {
  category: BudgetCategory;
  items: BudgetItem[];
  onAddItem: (categoryId: string) => void;
  onEditItem: (item: BudgetItem) => void;
  onDeleteItem: (item: BudgetItem) => void;
  onEditCategory: (category: BudgetCategory) => void;
  onDeleteCategory: (category: BudgetCategory) => void;
  deletingItemId: string | null;
}

export function BudgetCategoryCard({
  category,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onEditCategory,
  onDeleteCategory,
  deletingItemId,
}: BudgetCategoryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);

  const { totalEstimasi, totalRealisasi, persen, lunas, dp, belum } =
    useMemo(() => {
      const est = items.reduce((s, i) => s + (i.estimasi || 0), 0);
      const real = items.reduce((s, i) => s + (i.realisasi || 0), 0);
      const pct = est > 0 ? Math.min(Math.round((real / est) * 100), 100) : 0;
      return {
        totalEstimasi: est,
        totalRealisasi: real,
        persen: pct,
        lunas: items.filter((i) => i.status === "lunas").length,
        dp: items.filter((i) => i.status === "dp").length,
        belum: items.filter((i) => i.status === "belum_bayar").length,
      };
    }, [items]);

  const confirmDeleteItem = (item: BudgetItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Category Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <span className="text-xl shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground text-sm">
              {category.nama}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {items.length > 0 && (
                <>
                  <span>{items.length} item</span>
                  {lunas > 0 && (
                    <span className="text-green-400">· {lunas} lunas</span>
                  )}
                  {dp > 0 && <span className="text-yellow-400">· {dp} DP</span>}
                  {belum > 0 && <span>· {belum} belum</span>}
                </>
              )}
            </div>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    persen >= 100
                      ? "bg-green-500"
                      : persen >= 50
                      ? "bg-primary"
                      : "bg-muted-foreground/40"
                  )}
                  style={{ width: `${persen}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {fmtCompact(totalRealisasi)} / {fmtCompact(totalEstimasi)}
              </span>
            </div>
          )}
        </div>
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => onEditCategory(category)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDeleteCategory(category)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            className="h-7 px-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 border-0 shadow-none gap-1"
            variant="outline"
            onClick={() => onAddItem(category.id)}
          >
            <Plus className="h-3 w-3" />
            Tambah
          </Button>
          <div className="ml-1">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      {expanded && (
        <div className="border-t border-border">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground italic">
                Belum ada item di kategori ini
              </p>
              <button
                onClick={() => onAddItem(category.id)}
                className="text-xs text-primary hover:underline mt-1"
              >
                + Tambah item pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">
                        {item.nama}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          STATUS_CONFIG[item.status].className
                        )}
                      >
                        {STATUS_CONFIG[item.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      {item.estimasi > 0 && (
                        <span>Total: {fmt(item.estimasi)}</span>
                      )}
                      {item.dp > 0 && item.status !== "lunas" && (
                        <span className="text-yellow-400">
                          DP: {fmt(item.dp)}
                        </span>
                      )}
                      {item.status === "dp" && item.estimasi > 0 && (
                        <span className="text-destructive">
                          Sisa:{" "}
                          {fmt(
                            item.estimasi - (item.realisasi || item.dp || 0)
                          )}
                        </span>
                      )}
                      {item.status === "lunas" && item.realisasi > 0 && (
                        <span className="text-green-400">
                          Dibayar: {fmt(item.realisasi)}
                        </span>
                      )}
                      {item.tanggal_dp && item.status === "dp" && (
                        <span>
                          DP:{" "}
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(item.tanggal_dp))}
                        </span>
                      )}
                      {item.tanggal_lunas && item.status === "lunas" && (
                        <span>
                          Lunas:{" "}
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(item.tanggal_lunas))}
                        </span>
                      )}
                      {item.vendor_nama && (
                        <span className="text-primary">
                          🏪 {item.vendor_nama}
                        </span>
                      )}
                    </div>
                    {item.catatan && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic line-clamp-1">
                        {item.catatan}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => onEditItem(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => confirmDeleteItem(item)}
                      disabled={deletingItemId === item.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Item Confirm */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[450px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Konfirmasi Hapus
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus item{" "}
              <span className="font-bold text-destructive">
                {itemToDelete?.nama}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToDelete) {
                  onDeleteItem(itemToDelete);
                  setDeleteConfirmOpen(false);
                  setItemToDelete(null);
                }
              }}
              className="flex-1 h-11 bg-destructive hover:bg-destructive/90 text-white font-medium shadow-md"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
