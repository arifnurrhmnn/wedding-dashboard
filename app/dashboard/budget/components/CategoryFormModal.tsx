"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BudgetCategory } from "@/redux/slices/budgetSlice";

const EMOJI_OPTIONS = [
  "🏛️",
  "🍽️",
  "📸",
  "💐",
  "👗",
  "🎵",
  "💌",
  "🎁",
  "📄",
  "🚗",
  "👔",
  "💰",
  "🔆",
  "✨",
  "🎀",
  "🎂",
  "💍",
  "🥂",
  "🌸",
  "🎶",
];

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: BudgetCategory | null;
  onSubmit: (data: { nama: string; icon: string }) => Promise<void>;
  loading: boolean;
}

export function CategoryFormModal({
  open,
  onOpenChange,
  category,
  onSubmit,
  loading,
}: CategoryFormModalProps) {
  const isEdit = !!category;
  const [nama, setNama] = useState(category?.nama ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "💰");

  useEffect(() => {
    if (open) {
      setNama(category?.nama ?? "");
      setIcon(category?.icon ?? "💰");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ nama, icon });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-border shadow-2xl bg-card">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {isEdit ? "Edit" : "Tambah"} Kategori
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Update nama atau ikon kategori"
              : "Tambahkan kategori pengeluaran baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            {/* Icon picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Ikon
              </Label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setIcon(e)}
                    className={`w-9 h-9 text-lg rounded-md border-2 transition-all flex items-center justify-center ${
                      icon === e
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {e}
                  </button>
                ))}
                {/* Custom input */}
                <input
                  type="text"
                  maxLength={2}
                  value={EMOJI_OPTIONS.includes(icon) ? "" : icon}
                  onChange={(e) => setIcon(e.target.value || "💰")}
                  placeholder="?"
                  className="w-9 h-9 text-center text-lg rounded-md border-2 border-border bg-input outline-none focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Preview: <span className="text-lg">{icon}</span>{" "}
                {nama || "Nama Kategori"}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="nama"
                className="text-sm font-medium text-foreground"
              >
                Nama Kategori <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                placeholder="cth: Venue & Gedung"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </div>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
