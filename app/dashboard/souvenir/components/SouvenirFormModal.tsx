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
import { Souvenir } from "@/redux/slices/souvenirSlice";
import { SOUVENIR_STATUS_OPTIONS } from "@/utils/constants";

interface SouvenirFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Souvenir | null;
  onSubmit: (data: Omit<Souvenir, "id" | "created_at">) => void;
  loading: boolean;
}

const getInitialFormData = (item: Souvenir | null | undefined) => {
  if (item) {
    return {
      nama_souvenir: item.nama_souvenir,
      jumlah: item.jumlah,
      vendor: item.vendor || "",
      status_pengadaan: item.status_pengadaan,
      harga_per_item: item.harga_per_item,
      catatan: item.catatan || "",
    };
  }
  return {
    nama_souvenir: "",
    jumlah: 0,
    vendor: "",
    status_pengadaan: "Belum Dibeli",
    harga_per_item: 0,
    catatan: "",
  };
};

export function SouvenirFormModal({
  open,
  onOpenChange,
  item,
  onSubmit,
  loading,
}: SouvenirFormModalProps) {
  const [formData, setFormData] = useState(() => getInitialFormData(item));

  useEffect(() => {
    setFormData(getInitialFormData(item));
  }, [item]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData(getInitialFormData(item));
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {item ? "Edit" : "Tambah"} Souvenir
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {item ? "Update data souvenir" : "Tambahkan souvenir baru"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="nama_souvenir"
                className="text-sm font-medium text-foreground"
              >
                Nama Souvenir <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama_souvenir"
                value={formData.nama_souvenir}
                onChange={(e) =>
                  setFormData({ ...formData, nama_souvenir: e.target.value })
                }
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                placeholder="Masukkan nama souvenir"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="jumlah"
                  className="text-sm font-medium text-foreground"
                >
                  Jumlah <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="jumlah"
                  type="text"
                  inputMode="numeric"
                  value={formData.jumlah || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFormData({
                      ...formData,
                      jumlah: value ? parseInt(value) : 0,
                    });
                  }}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="harga_per_item"
                  className="text-sm font-medium text-foreground"
                >
                  Harga per Item
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    id="harga_per_item"
                    type="text"
                    inputMode="numeric"
                    value={
                      formData.harga_per_item > 0
                        ? new Intl.NumberFormat("id-ID").format(
                            formData.harga_per_item
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({
                        ...formData,
                        harga_per_item: value ? parseFloat(value) : 0,
                      });
                    }}
                    className="w-full h-11 pl-10 pr-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="vendor"
                className="text-sm font-medium text-foreground"
              >
                Vendor
              </Label>
              <Input
                id="vendor"
                value={formData.vendor}
                onChange={(e) =>
                  setFormData({ ...formData, vendor: e.target.value })
                }
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                placeholder="Nama vendor atau link"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status_pengadaan"
                className="text-sm font-medium text-foreground"
              >
                Status Pengadaan
              </Label>
              <Select
                value={formData.status_pengadaan}
                onValueChange={(value) =>
                  setFormData({ ...formData, status_pengadaan: value })
                }
              >
                <SelectTrigger
                  id="status_pengadaan"
                  className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                >
                  <SelectValue placeholder="Pilih status" />
                  <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {SOUVENIR_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                value={formData.catatan}
                onChange={(e) =>
                  setFormData({ ...formData, catatan: e.target.value })
                }
                className="w-full min-h-20 px-3 py-2 text-sm bg-input border border-input rounded-md shadow-xs placeholder:text-muted-foreground outline-none transition-[color,box-shadow] resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                placeholder="Tambahkan catatan (opsional)"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
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
