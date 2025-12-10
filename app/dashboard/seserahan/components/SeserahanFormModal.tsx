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
import { Seserahan } from "@/redux/slices/seserahanSlice";
import {
  SESERAHAN_KATEGORI_OPTIONS,
  SESERAHAN_STATUS_OPTIONS,
} from "@/utils/constants";

interface SeserahanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Seserahan | null;
  onSubmit: (data: Omit<Seserahan, "id" | "created_at">) => void;
  loading: boolean;
}

const getInitialFormData = (item: Seserahan | null | undefined) => {
  if (item) {
    return {
      nama_item: item.nama_item,
      kategori: item.kategori,
      brand: item.brand || "",
      status_pembelian: item.status_pembelian,
      harga: item.harga,
      link_marketplace: item.link_marketplace || "",
      catatan: item.catatan || "",
    };
  }
  return {
    nama_item: "",
    kategori: "",
    brand: "",
    status_pembelian: "Belum Dibeli",
    harga: 0,
    link_marketplace: "",
    catatan: "",
  };
};

export function SeserahanFormModal({
  open,
  onOpenChange,
  item,
  onSubmit,
  loading,
}: SeserahanFormModalProps) {
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
      <DialogContent className="sm:max-w-[500px] border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {item ? "Edit" : "Tambah"} Seserahan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {item ? "Update data seserahan" : "Tambahkan seserahan baru"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="nama_item"
                className="text-sm font-medium text-foreground"
              >
                Nama Item <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama_item"
                value={formData.nama_item}
                onChange={(e) =>
                  setFormData({ ...formData, nama_item: e.target.value })
                }
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                placeholder="Masukkan nama item"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="kategori"
                  className="text-sm font-medium text-foreground"
                >
                  Kategori <span className="text-destructive">*</span>
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
                    {SESERAHAN_KATEGORI_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="brand"
                  className="text-sm font-medium text-foreground"
                >
                  Brand
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="Masukkan brand (opsional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="harga"
                className="text-sm font-medium text-foreground"
              >
                Harga
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="harga"
                  type="text"
                  inputMode="numeric"
                  value={
                    formData.harga > 0
                      ? new Intl.NumberFormat("id-ID").format(formData.harga)
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFormData({
                      ...formData,
                      harga: value ? parseFloat(value) : 0,
                    });
                  }}
                  className="w-full h-11 pl-10 pr-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="link_marketplace"
                className="text-sm font-medium text-foreground"
              >
                Link Marketplace
              </Label>
              <Input
                id="link_marketplace"
                type="url"
                value={formData.link_marketplace}
                onChange={(e) =>
                  setFormData({ ...formData, link_marketplace: e.target.value })
                }
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                placeholder="https://tokopedia.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="status_pembelian"
                className="text-sm font-medium text-foreground"
              >
                Status Pembelian
              </Label>
              <Select
                value={formData.status_pembelian}
                onValueChange={(value) =>
                  setFormData({ ...formData, status_pembelian: value })
                }
              >
                <SelectTrigger
                  id="status_pembelian"
                  className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                >
                  <SelectValue placeholder="Pilih status" />
                  <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {SESERAHAN_STATUS_OPTIONS.map((option) => (
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
