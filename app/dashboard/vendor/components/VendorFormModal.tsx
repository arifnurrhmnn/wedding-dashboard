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
import { Vendor } from "@/redux/slices/vendorSlice";

const CATEGORIES = [
  "Foto & Video",
  "Katering & Konsumsi",
  "Venue & Gedung",
  "Dekorasi & Florist",
  "Busana & Kebaya",
  "MUA (Make Up Artist)",
  "Entertainment & Band",
  "Wedding Cake",
  "Undangan & Percetakan",
  "Transportasi",
  "Wedding Organizer (WO)",
  "Lainnya",
];

const STATUS_OPTIONS = [
  { value: "prospek", label: "Prospek" },
  { value: "negosiasi", label: "Negosiasi" },
  { value: "deal", label: "Deal" },
  { value: "batal", label: "Batal" },
];

interface VendorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSubmit: (data: Omit<Vendor, "id">) => void;
  loading?: boolean;
}

const getInitialForm = (vendor: Vendor | null | undefined) => ({
  nama: vendor?.nama || "",
  kategori: vendor?.kategori || "Foto & Video",
  kontak_nama: vendor?.kontak_nama || "",
  kontak_wa: vendor?.kontak_wa || "",
  kontak_email: vendor?.kontak_email || "",
  website: vendor?.website || "",
  instagram: vendor?.instagram || "",
  alamat: vendor?.alamat || "",
  catatan: vendor?.catatan || "",
  status: (vendor?.status || "prospek") as Vendor["status"],
});

export function VendorFormModal({
  open,
  onOpenChange,
  vendor,
  onSubmit,
  loading,
}: VendorFormModalProps) {
  const isEdit = !!vendor;
  const [form, setForm] = useState(() => getInitialForm(vendor));

  useEffect(() => {
    setForm(getInitialForm(vendor));
  }, [vendor]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) setForm(getInitialForm(vendor));
    onOpenChange(newOpen);
  };

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form as Omit<Vendor, "id">);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {isEdit ? "Edit" : "Tambah"} Vendor
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? "Update informasi vendor"
              : "Tambahkan vendor pernikahan baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Nama & Kategori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nama"
                  className="text-sm font-medium text-foreground"
                >
                  Nama Vendor <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  value={form.nama}
                  onChange={(e) => set("nama", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="cth: Studio Angin Segar"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="kategori"
                  className="text-sm font-medium text-foreground"
                >
                  Kategori <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.kategori}
                  onValueChange={(v) => set("kategori", v)}
                >
                  <SelectTrigger
                    id="kategori"
                    className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                  >
                    <SelectValue placeholder="Pilih kategori" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-foreground"
              >
                Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger
                  id="status"
                  className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                >
                  <SelectValue placeholder="Pilih status" />
                  <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kontak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="kontak_nama"
                  className="text-sm font-medium text-foreground"
                >
                  Nama PIC / Kontak
                </Label>
                <Input
                  id="kontak_nama"
                  value={form.kontak_nama}
                  onChange={(e) => set("kontak_nama", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="Nama orang yang bisa dihubungi"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="kontak_wa"
                  className="text-sm font-medium text-foreground"
                >
                  No. WhatsApp
                </Label>
                <Input
                  id="kontak_wa"
                  value={form.kontak_wa}
                  onChange={(e) => set("kontak_wa", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="0812xxxx"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="kontak_email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </Label>
                <Input
                  id="kontak_email"
                  type="email"
                  value={form.kontak_email}
                  onChange={(e) => set("kontak_email", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="vendor@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="instagram"
                  className="text-sm font-medium text-foreground"
                >
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={form.instagram}
                  onChange={(e) => set("instagram", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="@namaakun"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="website"
                  className="text-sm font-medium text-foreground"
                >
                  Website
                </Label>
                <Input
                  id="website"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="alamat"
                  className="text-sm font-medium text-foreground"
                >
                  Alamat
                </Label>
                <Input
                  id="alamat"
                  value={form.alamat}
                  onChange={(e) => set("alamat", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="Alamat vendor"
                />
              </div>
            </div>

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
                className="w-full min-h-20 px-3 py-2 text-sm bg-input border border-input rounded-md shadow-xs placeholder:text-muted-foreground outline-none transition-[color,box-shadow] resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                placeholder="Catatan tambahan (opsional)"
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
