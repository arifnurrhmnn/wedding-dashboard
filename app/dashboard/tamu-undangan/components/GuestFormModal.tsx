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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { Guest } from "@/redux/slices/guestSlice";
import {
  KATEGORI_OPTIONS,
  SKALA_PRIORITAS_OPTIONS,
  TIPE_UNDANGAN_OPTIONS,
} from "@/utils/constants";

interface GuestFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Guest | null;
  onSubmit: (data: Omit<Guest, "id" | "created_at">) => void;
  loading: boolean;
}

const getInitialFormData = (guest: Guest | null | undefined) => {
  if (guest) {
    return {
      nama: guest.nama,
      kategori: guest.kategori,
      skala_prioritas: guest.skala_prioritas,
      tipe_undangan: guest.tipe_undangan,
      qty: guest.qty,
    };
  }
  return {
    nama: "",
    kategori: "",
    skala_prioritas: "",
    tipe_undangan: "",
    qty: 1,
  };
};

export function GuestFormModal({
  open,
  onOpenChange,
  guest,
  onSubmit,
  loading,
}: GuestFormModalProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(guest));

  // Update formData when guest changes
  useEffect(() => {
    setFormData(getInitialFormData(guest));
  }, [guest]);

  // Reset form when dialog opens/closes or guest changes
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData(getInitialFormData(guest));
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-border shadow-2xl bg-card">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {guest ? "Edit" : "Tambah"} Tamu Undangan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {guest
              ? "Update data tamu undangan"
              : "Tambahkan tamu undangan baru"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="nama"
                className="text-sm font-medium text-foreground"
              >
                Nama
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                placeholder="Masukkan nama tamu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="kategori"
                className="text-sm font-medium text-foreground"
              >
                Kategori
              </Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) =>
                  setFormData({ ...formData, kategori: value })
                }
                required
              >
                <SelectTrigger
                  id="kategori"
                  className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                >
                  <SelectValue placeholder="Pilih kategori" />
                  <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {KATEGORI_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="skala_prioritas"
                className="text-sm font-medium text-foreground"
              >
                Skala Prioritas
              </Label>
              <Select
                value={formData.skala_prioritas}
                onValueChange={(value) =>
                  setFormData({ ...formData, skala_prioritas: value })
                }
                required
              >
                <SelectTrigger
                  id="skala_prioritas"
                  className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                >
                  <SelectValue placeholder="Pilih skala prioritas" />
                  <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {SKALA_PRIORITAS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="tipe_undangan"
                className="text-sm font-medium text-foreground"
              >
                Tipe Undangan
              </Label>
              <Select
                value={formData.tipe_undangan}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipe_undangan: value })
                }
                required
              >
                <SelectTrigger
                  id="tipe_undangan"
                  className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                >
                  <SelectValue placeholder="Pilih tipe undangan" />
                  <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {TIPE_UNDANGAN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="qty"
                className="text-sm font-medium text-foreground"
              >
                Quantity
              </Label>
              <Input
                id="qty"
                type="number"
                min="1"
                value={formData.qty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qty: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                placeholder="Masukkan jumlah"
                required
              />
            </div>
          </div>
          <DialogFooter className="gap-3 pt-4">
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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
