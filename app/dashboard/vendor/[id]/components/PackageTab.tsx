"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/redux/hooks";
import {
  VendorPackage,
  addVendorPackage,
  updateVendorPackage,
  deleteVendorPackage,
  setFinalPackage,
} from "@/redux/slices/vendorSlice";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  CheckCircle2,
  Package,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

interface PackageFormData {
  nama_paket: string;
  deskripsi: string;
  harga: string;
}

const emptyForm: PackageFormData = { nama_paket: "", deskripsi: "", harga: "" };

interface PackageTabProps {
  vendorId: string;
  packages: VendorPackage[];
  vendorStatus: string;
}

export function PackageTab({
  vendorId,
  packages,
  vendorStatus,
}: PackageTabProps) {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<VendorPackage | null>(null);
  const [form, setForm] = useState<PackageFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingPkg, setDeletingPkg] = useState<VendorPackage | null>(null);

  const set = (key: keyof PackageFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openAdd = () => {
    setEditingPkg(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (pkg: VendorPackage) => {
    setEditingPkg(pkg);
    setForm({
      nama_paket: pkg.nama_paket,
      deskripsi: pkg.deskripsi || "",
      harga: String(pkg.harga),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_paket || !form.harga) return;
    setLoading(true);
    try {
      const data = {
        nama_paket: form.nama_paket,
        deskripsi: form.deskripsi,
        harga: Number(form.harga),
      };
      if (editingPkg) {
        await dispatch(
          updateVendorPackage({ vendorId, packageId: editingPkg.id, data })
        ).unwrap();
        toast.success("Paket berhasil diupdate!");
      } else {
        await dispatch(
          addVendorPackage({ vendorId, data: { ...data, is_final: false } })
        ).unwrap();
        toast.success("Paket berhasil ditambahkan!");
      }
      setModalOpen(false);
    } catch {
      toast.error("Terjadi kesalahan!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPkg) return;
    setLoading(true);
    try {
      await dispatch(
        deleteVendorPackage({ vendorId, packageId: deletingPkg.id })
      ).unwrap();
      toast.success("Paket berhasil dihapus!");
      setDeleteOpen(false);
      setDeletingPkg(null);
    } catch {
      toast.error("Gagal menghapus paket!");
    } finally {
      setLoading(false);
    }
  };

  const handleSetFinal = async (pkg: VendorPackage) => {
    if (pkg.is_final) return;
    try {
      await dispatch(setFinalPackage({ vendorId, packageId: pkg.id })).unwrap();
      toast.success(`"${pkg.nama_paket}" ditetapkan sebagai paket final`);
    } catch {
      toast.error("Gagal menetapkan paket final");
    }
  };

  const finalPkg = packages.find((p) => p.is_final);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Daftar Paket</h3>
          <p className="text-sm text-muted-foreground">
            {packages.length} paket tersedia
            {finalPkg ? ` · Paket final: ${finalPkg.nama_paket}` : ""}
          </p>
        </div>
        <Button
          size="sm"
          onClick={openAdd}
          className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Paket
        </Button>
      </div>

      {/* Final Package Banner */}
      {finalPkg && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-400">
              Paket Final: {finalPkg.nama_paket}
            </p>
            <p className="text-sm text-foreground font-bold">
              {fmt(finalPkg.harga)}
            </p>
          </div>
        </div>
      )}

      {/* Package List */}
      {packages.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Belum ada paket</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Klik &quot;Tambah Paket&quot; untuk menambahkan penawaran harga
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "border rounded-lg px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all",
                pkg.is_final
                  ? "bg-primary/5 border-primary/30"
                  : "bg-card border-border"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">
                    {pkg.nama_paket}
                  </p>
                  {pkg.is_final && (
                    <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Final
                    </span>
                  )}
                </div>
                {pkg.deskripsi && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {pkg.deskripsi}
                  </p>
                )}
                <p className="text-base font-bold text-foreground mt-1">
                  {fmt(pkg.harga)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!pkg.is_final && vendorStatus !== "batal" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                    onClick={() => handleSetFinal(pkg)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Set Final
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => openEdit(pkg)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setDeletingPkg(pkg);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          key={editingPkg?.id ?? "new-pkg"}
          className="sm:max-w-[500px] border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {editingPkg ? "Edit" : "Tambah"} Paket
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingPkg
                ? "Update informasi paket vendor"
                : "Tambahkan penawaran paket baru"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nama_paket"
                  className="text-sm font-medium text-foreground"
                >
                  Nama Paket <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama_paket"
                  value={form.nama_paket}
                  onChange={(e) => set("nama_paket", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="cth: Paket Silver, Paket Dokumentasi Penuh"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="harga"
                  className="text-sm font-medium text-foreground"
                >
                  Harga <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    id="harga"
                    type="text"
                    inputMode="numeric"
                    value={
                      form.harga
                        ? new Intl.NumberFormat("id-ID").format(
                            Number(form.harga)
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      set("harga", raw);
                    }}
                    className="w-full h-11 pl-10 pr-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                    placeholder="0"
                    required
                  />
                </div>
                {form.harga && (
                  <p className="text-xs text-muted-foreground">
                    = {fmt(Number(form.harga))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="deskripsi"
                  className="text-sm font-medium text-foreground"
                >
                  Deskripsi
                </Label>
                <textarea
                  id="deskripsi"
                  value={form.deskripsi}
                  onChange={(e) => set("deskripsi", e.target.value)}
                  className="w-full min-h-20 px-3 py-2 text-sm bg-input border border-input rounded-md shadow-xs placeholder:text-muted-foreground outline-none transition-[color,box-shadow] resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  placeholder="Detail isi paket (opsional)"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
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

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
              Apakah Anda yakin ingin menghapus paket{" "}
              <span className="font-bold text-destructive">
                {deletingPkg?.nama_paket}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 h-11 bg-destructive hover:bg-destructive/90 text-white font-medium shadow-md"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghapus...
                </div>
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
