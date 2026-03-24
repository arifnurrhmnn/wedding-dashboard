"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Handshake,
  RefreshCw,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  Vendor,
} from "@/redux/slices/vendorSlice";
import { VendorTable } from "./components/VendorTable";
import { VendorFormModal } from "./components/VendorFormModal";
import { toast } from "sonner";

export default function VendorPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.vendor);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  // ── Stat calculations ──
  const totalVendor = list.length;
  const totalDeal = list.filter((v) => v.status === "deal").length;
  const totalNego = list.filter((v) => v.status === "negosiasi").length;
  const totalNilaiKontrak = list.reduce((sum, v) => {
    const finalPkg = v.vendor_packages?.find((p) => p.is_final);
    return sum + (finalPkg?.harga || 0);
  }, 0);

  // ── Handlers ──
  const handleAdd = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDelete = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Omit<Vendor, "id">) => {
    try {
      if (editingVendor) {
        await dispatch(updateVendor({ id: editingVendor.id, data })).unwrap();
        toast.success("Vendor berhasil diupdate!");
      } else {
        await dispatch(addVendor(data)).unwrap();
        toast.success("Vendor berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setEditingVendor(null);
    } catch {
      toast.error("Terjadi kesalahan!");
    }
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      await dispatch(deleteVendor(vendorToDelete.id)).unwrap();
      toast.success("Vendor berhasil dihapus!");
      setDeleteDialogOpen(false);
      setVendorToDelete(null);
    } catch {
      toast.error("Gagal menghapus vendor!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Vendor
          </h1>
          <p className="text-muted-foreground">
            Kelola semua vendor pernikahan Anda dalam satu tempat
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="h-10 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
        >
          <Plus className="h-4 w-4" />
          Tambah Vendor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Vendor</p>
              <p className="text-2xl font-bold text-foreground">
                {totalVendor}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sudah Deal</p>
              <p className="text-2xl font-bold text-green-500">{totalDeal}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Handshake className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Negosiasi</p>
              <p className="text-2xl font-bold text-yellow-500">{totalNego}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <RefreshCw className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Nilai Kontrak</p>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                  notation: "compact",
                }).format(totalNilaiKontrak)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && list.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="inline-block h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <VendorTable data={list} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Form Modal */}
      <VendorFormModal
        key={editingVendor?.id ?? "new"}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        vendor={editingVendor}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              Apakah Anda yakin ingin menghapus vendor{" "}
              <span className="font-bold text-destructive">
                {vendorToDelete?.nama}
              </span>
              ? Semua paket, dokumen, dan log aktivitas vendor ini juga akan
              terhapus. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
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
