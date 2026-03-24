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
import { DollarSign } from "lucide-react";

interface SetBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBudget: number;
  currentCatatan?: string;
  onSubmit: (total_budget: number, catatan: string) => Promise<void>;
  loading: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export function SetBudgetModal({
  open,
  onOpenChange,
  currentBudget,
  currentCatatan = "",
  onSubmit,
  loading,
}: SetBudgetModalProps) {
  const [budget, setBudget] = useState(String(currentBudget || ""));
  const [catatan, setCatatan] = useState(currentCatatan);

  // Reset form when modal opens
  const prevOpen = useState(open)[0];
  useEffect(() => {
    if (open && !prevOpen) {
      setBudget(String(currentBudget || ""));
      setCatatan(currentCatatan ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(Number(budget), catatan);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-border shadow-2xl bg-card">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Set Total Budget
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tetapkan total anggaran pernikahan Anda sebagai acuan keseluruhan
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label
                htmlFor="total_budget"
                className="text-sm font-medium text-foreground"
              >
                Total Budget <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  Rp
                </span>
                <Input
                  id="total_budget"
                  type="text"
                  inputMode="numeric"
                  value={
                    budget
                      ? new Intl.NumberFormat("id-ID").format(Number(budget))
                      : ""
                  }
                  onChange={(e) =>
                    setBudget(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="w-full h-11 pl-10 pr-3 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="0"
                  required
                />
              </div>
              {budget && (
                <p className="text-xs text-muted-foreground">
                  = {fmt(Number(budget))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="catatan"
                className="text-sm font-medium text-foreground"
              >
                Catatan
              </Label>
              <textarea
                id="catatan"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                className="w-full min-h-[72px] px-3 py-2 text-sm bg-input border border-input rounded-md shadow-xs placeholder:text-muted-foreground outline-none transition-[color,box-shadow] resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                placeholder="Contoh: Budget untuk 500 pax, sudah termasuk seserahan"
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
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Simpan Budget
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
