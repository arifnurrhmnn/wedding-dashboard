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
  ListTodo,
  Clock,
  CheckCircle2,
  Sparkles,
  Calendar,
  Info,
} from "lucide-react";
import Link from "next/link";
import { ChecklistTable } from "./components/ChecklistTable";
import { ChecklistFormModal } from "./components/ChecklistFormModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchChecklist,
  addChecklistTask,
  updateChecklistTask,
  inlineUpdateChecklistTask,
  deleteChecklistTask,
  generateDefaultTemplate,
  ChecklistTask,
} from "@/redux/slices/checklistSlice";
import { toast } from "sonner";

export default function ChecklistPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.checklist);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistTask | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ChecklistTask | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchChecklist());
  }, [dispatch]);

  const openGenerateDialog = () => {
    setGenerateDialogOpen(true);
  };

  const handleGenerateTemplate = async () => {
    try {
      const result = await dispatch(generateDefaultTemplate()).unwrap();
      const addedCount = result?.addedCount || 0;

      // Fetch ulang data untuk memastikan list terupdate dengan benar
      await dispatch(fetchChecklist()).unwrap();

      setGenerateDialogOpen(false);

      if (addedCount > 0) {
        toast.success(
          `Berhasil menambahkan ${addedCount} task baru ke checklist!`
        );
      } else {
        toast.info("Semua task template sudah ada di checklist Anda.");
      }
    } catch {
      setGenerateDialogOpen(false);
      toast.error("Terjadi kesalahan saat generate template");
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: ChecklistTask) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (
    data: Omit<ChecklistTask, "id" | "created_at">
  ) => {
    try {
      // Filter out fields that shouldn't be sent (unique_id, created_at, updated_at, etc.)
      const cleanData = {
        title: data.title,
        description: data.description,
        category: data.category,
        timeline_phase: data.timeline_phase,
        due_date: data.due_date || undefined,
        status: data.status,
        priority: data.priority,
      };

      if (editingItem) {
        await dispatch(
          updateChecklistTask({ id: editingItem.id, data: cleanData })
        ).unwrap();
        toast.success("Task berhasil diupdate!");
      } else {
        await dispatch(addChecklistTask(cleanData)).unwrap();
        toast.success("Task berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Terjadi kesalahan!");
    }
  };

  const handleInlineUpdate = async (
    id: string,
    field: string,
    value: string | number
  ) => {
    try {
      await dispatch(inlineUpdateChecklistTask({ id, field, value })).unwrap();
      toast.success("Task berhasil diupdate!");
    } catch {
      toast.error("Gagal mengupdate task!");
    }
  };

  const handleDelete = (item: ChecklistTask) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await dispatch(deleteChecklistTask(itemToDelete.id)).unwrap();
      toast.success("Task berhasil dihapus!");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      toast.error("Gagal menghapus task!");
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Calculate progress
  const totalTasks = list.length;
  const totalTodo = list.filter((item) => item.status === "todo").length;
  const totalInProgress = list.filter(
    (item) => item.status === "in_progress"
  ).length;
  const totalDone = list.filter((item) => item.status === "done").length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Checklist
          </h1>
          <p className="text-muted-foreground">
            Kelola to-do list persiapan pernikahan Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openGenerateDialog}
            className="h-10 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md gap-2"
            disabled={loading}
          >
            <Sparkles className="h-4 w-4" />
            Generate Template
          </Button>
          <Button
            onClick={handleAdd}
            className="h-10 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Task
          </Button>
        </div>
      </div>

      {/* Banner Edukasi - tampil hanya bila task kosong */}
      {list.length === 0 && !loading && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg shrink-0">
              <Info className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-foreground">
                Belum ada task yang dibuat
              </h3>
              <p className="text-sm text-muted-foreground">
                Gunakan template rekomendasi berdasarkan{" "}
                <strong>Planning</strong> untuk memulai checklist Anda, atau
                buat task manual sesuai kebutuhan.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={openGenerateDialog}
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Template
              </Button>
              <Link href="/dashboard/planning">
                <Button variant="outline" className="gap-2 border-blue-500/30">
                  <Calendar className="h-4 w-4" />
                  Lihat Planning
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <ListTodo className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">To Do</p>
              <p className="text-2xl font-bold text-gray-400">{totalTodo}</p>
            </div>
            <div className="p-3 bg-gray-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-400">
                {totalInProgress}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Done</p>
              <p className="text-2xl font-bold text-green-400">{totalDone}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-primary">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {loading && list.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="inline-block h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      ) : (
        <ChecklistTable
          data={list}
          onInlineUpdate={handleInlineUpdate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ChecklistFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        item={editingItem}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Generate Template Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-border shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              Generate Template Checklist?
            </DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground space-y-3 pt-2 px-6">
            <p className="text-sm">
              Template ini adalah rekomendasi berdasarkan{" "}
              <strong>Planning</strong> dari H-180 hingga H+7. Template akan
              menambah task baru yang belum ada di checklist kamu.
            </p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-2">
              <div className="font-semibold text-foreground text-sm">
                ⚠️ Catatan Penting:
              </div>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Tidak akan menghapus task yang sudah kamu buat</li>
                <li>Tidak akan menduplikasi task yang sudah ada</li>
                <li>Task baru hanya ditambahkan jika belum pernah ada</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
            <Link href="/dashboard/planning" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-border hover:bg-secondary gap-2"
                onClick={() => setGenerateDialogOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                Lihat Planning Dulu
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setGenerateDialogOpen(false)}
              className="flex-1 border-border hover:bg-secondary"
            >
              Batal
            </Button>
            <Button
              onClick={handleGenerateTemplate}
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-border shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus task &quot;
              <span className="font-semibold text-foreground">
                {itemToDelete?.title}
              </span>
              &quot;? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="flex-1 border-border hover:bg-secondary"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
