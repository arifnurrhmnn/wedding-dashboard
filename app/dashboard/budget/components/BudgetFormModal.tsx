"use client";

import { useState, useEffect, useMemo } from "react";
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
import { BudgetItem, BudgetCategory } from "@/redux/slices/budgetSlice";
import { Vendor } from "@/redux/slices/vendorSlice";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

interface BudgetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BudgetItem | null;
  defaultCategoryId?: string;
  categories: BudgetCategory[];
  vendors: Vendor[];
  onSubmit: (
    data: Omit<BudgetItem, "id" | "created_at" | "updated_at" | "vendor_nama">
  ) => Promise<void>;
  loading: boolean;
}

const getInitialForm = (
  item: BudgetItem | null | undefined,
  defaultCategoryId?: string
) => ({
  category_id: item?.category_id ?? defaultCategoryId ?? "",
  nama: item?.nama ?? "",
  estimasi: item?.estimasi ? String(item.estimasi) : "",
  dp: item?.dp ? String(item.dp) : "",
  tanggal_dp: item?.tanggal_dp ?? "",
  realisasi: item?.realisasi ? String(item.realisasi) : "",
  tanggal_lunas: item?.tanggal_lunas ?? "",
  catatan: item?.catatan ?? "",
  vendor_id: item?.vendor_id ?? "",
});

export function BudgetFormModal({
  open,
  onOpenChange,
  item,
  defaultCategoryId,
  categories,
  vendors,
  onSubmit,
  loading,
}: BudgetFormModalProps) {
  const isEdit = !!item;
  const [form, setForm] = useState(() =>
    getInitialForm(item, defaultCategoryId)
  );

  useEffect(() => {
    if (open) setForm(getInitialForm(item, defaultCategoryId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const estimasiNum = Number(form.estimasi) || 0;
  const dpNum = Number(form.dp) || 0;
  const realisasiNum = Number(form.realisasi) || 0;
  const hasDp = dpNum > 0;
  const sisa = estimasiNum - realisasiNum;

  const autoStatus: BudgetItem["status"] = useMemo(() => {
    if (realisasiNum > 0 && estimasiNum > 0 && realisasiNum >= estimasiNum)
      return "lunas";
    if (dpNum > 0 || realisasiNum > 0) return "dp";
    return "belum_bayar";
  }, [dpNum, realisasiNum, estimasiNum]);

  const isLunas = autoStatus === "lunas";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      category_id: form.category_id,
      nama: form.nama,
      estimasi: estimasiNum,
      dp: dpNum,
      tanggal_dp: form.tanggal_dp || undefined,
      realisasi: realisasiNum,
      tanggal_lunas: form.tanggal_lunas || undefined,
      status: autoStatus,
      tanggal_bayar: form.tanggal_dp || form.tanggal_lunas || undefined,
      catatan: form.catatan || undefined,
      vendor_id: form.vendor_id || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {isEdit ? "Edit" : "Tambah"} Item Budget
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Update informasi pengeluaran"
              : "Catat rencana atau realisasi pengeluaran"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-2">
            {/* Nama */}
            <div className="space-y-2">
              <Label
                htmlFor="nama"
                className="text-sm font-medium text-foreground"
              >
                Nama Item <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama"
                value={form.nama}
                onChange={(e) => set("nama", e.target.value)}
                className="w-full h-11 px-3 bg-input border-border focus:border-primary focus:ring-primary/20"
                placeholder="cth: Gedung Resepsi, Katering, Fotografer"
                required
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label
                htmlFor="category_id"
                className="text-sm font-medium text-foreground"
              >
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => set("category_id", v)}
              >
                <SelectTrigger
                  id="category_id"
                  className="w-full h-11 px-3 bg-input border-border"
                >
                  <SelectValue placeholder="Pilih kategori" />
                  <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimasi */}
            <div className="space-y-2">
              <Label
                htmlFor="estimasi"
                className="text-sm font-medium text-foreground"
              >
                Estimasi / Total Harga
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  Rp
                </span>
                <Input
                  id="estimasi"
                  type="text"
                  inputMode="numeric"
                  value={
                    form.estimasi
                      ? new Intl.NumberFormat("id-ID").format(
                          Number(form.estimasi)
                        )
                      : ""
                  }
                  onChange={(e) =>
                    set("estimasi", e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="w-full h-11 pl-10 pr-3 bg-input border-border focus:border-primary focus:ring-primary/20"
                  placeholder="0"
                />
              </div>
              {estimasiNum > 0 && (
                <p className="text-xs text-muted-foreground">
                  = {fmt(estimasiNum)}
                </p>
              )}
            </div>

            {/* DP Section */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-base">💳</span>
                <p className="text-sm font-semibold text-foreground">
                  DP / Uang Muka
                </p>
                <span className="text-xs text-muted-foreground">
                  (opsional)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dp"
                    className="text-sm font-medium text-foreground"
                  >
                    Nominal DP
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      Rp
                    </span>
                    <Input
                      id="dp"
                      type="text"
                      inputMode="numeric"
                      value={
                        form.dp
                          ? new Intl.NumberFormat("id-ID").format(
                              Number(form.dp)
                            )
                          : ""
                      }
                      onChange={(e) =>
                        set("dp", e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="w-full h-11 pl-10 pr-3 bg-input border-border focus:border-primary focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>
                  {dpNum > 0 && (
                    <p className="text-xs text-muted-foreground">
                      = {fmt(dpNum)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="tanggal_dp"
                    className="text-sm font-medium text-foreground"
                  >
                    Tanggal DP
                  </Label>
                  <Input
                    id="tanggal_dp"
                    type="date"
                    value={form.tanggal_dp}
                    onChange={(e) => set("tanggal_dp", e.target.value)}
                    disabled={!hasDp}
                    className="w-full h-11 px-3 bg-input border-border focus:border-primary focus:ring-primary/20 disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Pelunasan Section */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-base">✅</span>
                <p className="text-sm font-semibold text-foreground">
                  Pelunasan
                </p>
                <span className="text-xs text-muted-foreground">
                  (isi jika sudah lunas)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="realisasi"
                    className="text-sm font-medium text-foreground"
                  >
                    Total Sudah Dibayar
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      Rp
                    </span>
                    <Input
                      id="realisasi"
                      type="text"
                      inputMode="numeric"
                      value={
                        form.realisasi
                          ? new Intl.NumberFormat("id-ID").format(
                              Number(form.realisasi)
                            )
                          : ""
                      }
                      onChange={(e) =>
                        set("realisasi", e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="w-full h-11 pl-10 pr-3 bg-input border-border focus:border-primary focus:ring-primary/20"
                      placeholder="0"
                    />
                  </div>
                  {realisasiNum > 0 && (
                    <p className="text-xs text-muted-foreground">
                      = {fmt(realisasiNum)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="tanggal_lunas"
                    className="text-sm font-medium text-foreground"
                  >
                    Tanggal Lunas
                  </Label>
                  <Input
                    id="tanggal_lunas"
                    type="date"
                    value={form.tanggal_lunas}
                    onChange={(e) => set("tanggal_lunas", e.target.value)}
                    disabled={!isLunas && realisasiNum === 0}
                    className="w-full h-11 px-3 bg-input border-border focus:border-primary focus:ring-primary/20 disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Summary Preview */}
            {(estimasiNum > 0 || dpNum > 0 || realisasiNum > 0) && (
              <div className="rounded-lg bg-card border border-border px-4 py-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Ringkasan Pembayaran
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {estimasiNum > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Harga
                      </p>
                      <p className="font-semibold text-foreground">
                        {fmt(estimasiNum)}
                      </p>
                    </div>
                  )}
                  {dpNum > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        DP Dibayar
                      </p>
                      <p className="font-semibold text-yellow-400">
                        {fmt(dpNum)}
                      </p>
                    </div>
                  )}
                  {estimasiNum > 0 && realisasiNum < estimasiNum && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Sisa Tagihan
                      </p>
                      <p className="font-semibold text-destructive">
                        {fmt(sisa > 0 ? sisa : 0)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Status otomatis:
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      autoStatus === "lunas"
                        ? "bg-green-500/20 text-green-400"
                        : autoStatus === "dp"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {autoStatus === "lunas"
                      ? "✅ Lunas"
                      : autoStatus === "dp"
                      ? "💳 DP / Cicil"
                      : "⏳ Belum Bayar"}
                  </span>
                </div>
              </div>
            )}

            {/* Vendor */}
            {vendors.length > 0 && (
              <div className="space-y-2">
                <Label
                  htmlFor="vendor_id"
                  className="text-sm font-medium text-foreground"
                >
                  Link Vendor{" "}
                  <span className="text-muted-foreground font-normal">
                    (opsional)
                  </span>
                </Label>
                <Select
                  value={form.vendor_id || "none"}
                  onValueChange={(v) => set("vendor_id", v === "none" ? "" : v)}
                >
                  <SelectTrigger
                    id="vendor_id"
                    className="w-full h-11 px-3 bg-input border-border"
                  >
                    <SelectValue placeholder="Pilih vendor terkait" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      — Tidak terkait vendor —
                    </SelectItem>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.nama}{" "}
                        <span className="text-muted-foreground">
                          ({v.kategori})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Catatan */}
            <div className="space-y-2">
              <Label
                htmlFor="catatan"
                className="text-sm font-medium text-foreground"
              >
                Catatan
              </Label>
              <textarea
                id="catatan"
                value={form.catatan}
                onChange={(e) => set("catatan", e.target.value)}
                className="w-full min-h-[72px] px-3 py-2 text-sm bg-input border border-input rounded-md shadow-xs placeholder:text-muted-foreground outline-none transition-[color,box-shadow] resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                placeholder="Nomor invoice, nama kontak vendor, catatan pembayaran, dll... (opsional)"
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
              disabled={loading || !form.category_id || !form.nama}
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
