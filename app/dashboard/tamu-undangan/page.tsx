"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GuestTable } from "./components/GuestTable";
import { GuestFormModal } from "./components/GuestFormModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchGuests,
  addGuest,
  updateGuest,
  inlineUpdateGuest,
  Guest,
} from "@/redux/slices/guestSlice";
import { toast } from "sonner";

export default function TamuUndanganPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.guests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

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
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tamu
        </Button>
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
        />
      )}

      <GuestFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        guest={editingGuest}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
