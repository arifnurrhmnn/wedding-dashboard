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
import { Plus, AlertTriangle } from "lucide-react";
import { GuestTable } from "./components/GuestTable";
import { GuestFormModal } from "./components/GuestFormModal";
import { ImportExportButtons } from "./components/ImportExportButtons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchGuests,
  addGuest,
  updateGuest,
  inlineUpdateGuest,
  deleteGuest,
  Guest,
} from "@/redux/slices/guestSlice";
import { toast } from "sonner";

export default function TamuUndanganPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.guests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  useEffect(() => {
    dispatch(fetchGuests());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingGuest(null);
    setIsModalOpen(true);
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Omit<Guest, "id" | "created_at">) => {
    try {
      if (editingGuest) {
        await dispatch(updateGuest({ id: editingGuest.id, data })).unwrap();
        toast.success("Tamu berhasil diupdate!");
      } else {
        await dispatch(addGuest(data)).unwrap();
        toast.success("Tamu berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setEditingGuest(null);
    } catch {
      toast.error("Terjadi kesalahan!");
    }
  };

  const handleInlineUpdate = async (
    id: string,
    field: string,
    value: string
  ) => {
    try {
      await dispatch(inlineUpdateGuest({ id, field, value })).unwrap();
      toast.success("Data berhasil diupdate!");
    } catch {
      toast.error("Gagal mengupdate data!");
    }
  };

  const handleDelete = (guest: Guest) => {
    setGuestToDelete(guest);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!guestToDelete) return;

    try {
      await dispatch(deleteGuest(guestToDelete.id)).unwrap();
      toast.success("Tamu berhasil dihapus!");
      setDeleteDialogOpen(false);
      setGuestToDelete(null);
    } catch {
      toast.error("Gagal menghapus tamu!");
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setGuestToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tamu Undangan
          </h1>
          <p className="text-muted-foreground">
            Kelola daftar tamu undangan pernikahan Anda
          </p>
        </div>
        <div className="flex gap-2">
          <ImportExportButtons
            onImportSuccess={() => dispatch(fetchGuests())}
            guests={list}
          />
          <Button
            onClick={handleAdd}
            className="h-10 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Tamu
          </Button>
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
        <GuestTable
          data={list}
          onInlineUpdate={handleInlineUpdate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <GuestFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        guest={editingGuest}
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
              Apakah Anda yakin ingin menghapus tamu{" "}
              <span className="font-bold text-destructive">
                {guestToDelete?.nama}
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
