"use client";

import { useState } from "react";
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
import { Guest } from "@/redux/slices/guestSlice";

interface GiftFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: Guest | null;
  onSubmit: (
    id: string,
    gift_type: string | null,
    gift_value: string | null
  ) => Promise<void>;
  loading: boolean;
}

export function GiftFormModal({
  open,
  onOpenChange,
  guest,
  onSubmit,
  loading,
}: GiftFormModalProps) {
  const [giftType, setGiftType] = useState<"uang" | "kado" | null>(
    (guest?.gift_type as "uang" | "kado") ?? null
  );
  const [giftValue, setGiftValue] = useState(guest?.gift_value ?? "");

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && guest) {
      setGiftType((guest.gift_type as "uang" | "kado") ?? null);
      setGiftValue(guest.gift_value ?? "");
    }
    onOpenChange(newOpen);
  };
  const handleTypeCheck = (type: "uang" | "kado") => {
    if (giftType === type) {
      // uncheck
      setGiftType(null);
      setGiftValue("");
    } else {
      setGiftType(type);
      setGiftValue("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;
    await onSubmit(
      guest.id,
      giftType ?? null,
      giftType && giftValue.trim() ? giftValue.trim() : null
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px] border-border shadow-2xl bg-card">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Edit Gift
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Catat gift dari{" "}
            <span className="font-semibold text-foreground">{guest?.nama}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-2">
            {/* Nama (read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Nama Tamu
              </Label>
              <div className="h-11 px-3 flex items-center rounded-md bg-muted/50 border border-border text-foreground text-sm font-medium">
                {guest?.nama}
              </div>
            </div>

            {/* Tipe Gift - Checkbox */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Tipe Gift
              </Label>
              <div className="flex gap-4">
                {/* Uang */}
                <label
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border cursor-pointer transition-all flex-1 ${
                    giftType === "uang"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-input text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      giftType === "uang"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                    onClick={() => handleTypeCheck("uang")}
                  >
                    {giftType === "uang" && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm font-medium"
                    onClick={() => handleTypeCheck("uang")}
                  >
                    💵 Uang
                  </span>
                </label>

                {/* Kado */}
                <label
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border cursor-pointer transition-all flex-1 ${
                    giftType === "kado"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-input text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      giftType === "kado"
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                    onClick={() => handleTypeCheck("kado")}
                  >
                    {giftType === "kado" && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm font-medium"
                    onClick={() => handleTypeCheck("kado")}
                  >
                    🎁 Kado
                  </span>
                </label>
              </div>
            </div>

            {/* Nilai Gift - conditional */}
            {giftType === "uang" && (
              <div className="space-y-2">
                <Label
                  htmlFor="gift_value"
                  className="text-sm font-medium text-foreground"
                >
                  Nominal Uang
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    Rp
                  </span>
                  <Input
                    id="gift_value"
                    type="number"
                    min="0"
                    value={giftValue}
                    onChange={(e) => setGiftValue(e.target.value)}
                    className="pl-10 h-11 bg-input border-border focus:border-primary focus:ring-primary/20"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {giftType === "kado" && (
              <div className="space-y-2">
                <Label
                  htmlFor="gift_value"
                  className="text-sm font-medium text-foreground"
                >
                  Nama / Deskripsi Kado
                </Label>
                <Input
                  id="gift_value"
                  type="text"
                  value={giftValue}
                  onChange={(e) => setGiftValue(e.target.value)}
                  className="h-11 bg-input border-border focus:border-primary focus:ring-primary/20"
                  placeholder="Contoh: Blender, Voucher, dll."
                />
              </div>
            )}

            {/* Clear gift hint */}
            {(guest?.gift_type || giftType) && giftType === null && (
              <p className="text-xs text-muted-foreground">
                Centang salah satu tipe gift, atau biarkan kosong untuk
                menghapus data gift.
              </p>
            )}
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
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
