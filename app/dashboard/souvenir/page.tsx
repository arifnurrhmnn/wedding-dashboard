"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  AlertTriangle,
  Package,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { SouvenirTable } from "./components/SouvenirTable";
import { SouvenirFormModal } from "./components/SouvenirFormModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchSouvenir,
  addSouvenir,
  updateSouvenir,
  inlineUpdateSouvenir,
  deleteSouvenir,
  Souvenir,
} from "@/redux/slices/souvenirSlice";
import { toast } from "sonner";

export default function SouvenirPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.souvenir);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Souvenir | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Souvenir | null>(null);

  useEffect(() => {
    dispatch(fetchSouvenir());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Souvenir) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Omit<Souvenir, "id" | "created_at">) => {
    try {
      if (editingItem) {
        await dispatch(updateSouvenir({ id: editingItem.id, data })).unwrap();
        toast.success("Souvenir berhasil diupdate!");
      } else {
        await dispatch(addSouvenir(data)).unwrap();
        toast.success("Souvenir berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch {
      toast.error("Terjadi kesalahan!");
    }
  };

  const handleInlineUpdate = async (
    id: string,
    field: string,
    value: string | number
  ) => {
    try {
      await dispatch(inlineUpdateSouvenir({ id, field, value })).unwrap();
      toast.success("Data berhasil diupdate!");
    } catch {
      toast.error("Gagal mengupdate data!");
    }
  };

  const handleDelete = (item: Souvenir) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await dispatch(deleteSouvenir(itemToDelete.id)).unwrap();
      toast.success("Souvenir berhasil dihapus!");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      toast.error("Gagal menghapus souvenir!");
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Calculate summary
  const jumlahKeseluruhan = list.reduce((sum, item) => sum + item.jumlah, 0);
  const totalSudahDibeli = list.filter(
    (item) => item.status_pengadaan === "Sudah Dibeli"
  ).length;
  const totalBelumDibeli = list.filter(
    (item) => item.status_pengadaan === "Belum Dibeli"
  ).length;
  const totalBiaya = list.reduce(
    (sum, item) => sum + (item.total_harga || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Souvenir
          </h1>
          <p className="text-muted-foreground">
            Kelola daftar souvenir untuk tamu undangan pernikahan Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleAdd}
            className="h-10 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Souvenir
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Jumlah Keseluruhan
              </p>
              <p className="text-2xl font-bold text-foreground">
                {jumlahKeseluruhan}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sudah Dibeli</p>
              <p className="text-2xl font-bold text-green-400">
                {totalSudahDibeli}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Belum Dibeli</p>
              <p className="text-2xl font-bold text-red-400">
                {totalBelumDibeli}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Biaya</p>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalBiaya)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {loading && list.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="inline-block h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <SouvenirTable
          data={list}
          onInlineUpdate={handleInlineUpdate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <SouvenirFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={editingItem}
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
              Apakah Anda yakin ingin menghapus souvenir{" "}
              <span className="font-bold text-destructive">
                {itemToDelete?.nama_souvenir}
              </span>
              ?
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
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
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
