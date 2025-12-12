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
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from "lucide-react";
import { ScheduleFormModal } from "./components/ScheduleFormModal";
import { CalendarGrid } from "./components/CalendarGrid";
import { DailyEventDrawer } from "./components/DailyEventDrawer";
import { EventDetailModal } from "./components/EventDetailModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  Schedule,
} from "@/redux/slices/scheduleSlice";
import { toast } from "sonner";

export default function KalenderPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.schedules);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(
    null
  );

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    const month = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    dispatch(fetchSchedules({ month }));
  }, [dispatch, currentYear, currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddSchedule = (date?: Date) => {
    setEditingSchedule(null);
    setSelectedDate(date || null);
    setIsFormModalOpen(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setSelectedDate(null);
    setIsFormModalOpen(true);
    setSelectedSchedule(null);
  };

  const handleSubmit = async (
    data: Omit<Schedule, "id" | "created_at" | "updated_at">
  ) => {
    try {
      if (editingSchedule) {
        await dispatch(
          updateSchedule({ id: editingSchedule.id, data })
        ).unwrap();
        toast.success("Jadwal berhasil diupdate!");
      } else {
        await dispatch(addSchedule(data)).unwrap();
        toast.success("Jadwal berhasil ditambahkan!");
      }
      setIsFormModalOpen(false);
      setEditingSchedule(null);
      setSelectedDate(null);
    } catch {
      toast.error("Terjadi kesalahan!");
    }
  };

  const handleDeleteClick = (schedule: Schedule) => {
    setScheduleToDelete(schedule);
    setDeleteDialogOpen(true);
    setSelectedSchedule(null);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await dispatch(deleteSchedule(scheduleToDelete.id)).unwrap();
      toast.success("Jadwal berhasil dihapus!");
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    } catch {
      toast.error("Gagal menghapus jadwal!");
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setScheduleToDelete(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseDrawer = () => {
    setSelectedDate(null);
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleCloseEventDetail = () => {
    setSelectedSchedule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Kalender
          </h1>
          <p className="text-muted-foreground">
            Kelola jadwal persiapan pernikahan Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleAddSchedule()}
            className="h-10 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg shadow-sm">
        <Button
          onClick={handlePreviousMonth}
          variant="outline"
          size="icon"
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">{monthName}</h2>
          <Button
            onClick={handleToday}
            variant="outline"
            size="sm"
            className="h-8"
          >
            Hari Ini
          </Button>
        </div>

        <Button
          onClick={handleNextMonth}
          variant="outline"
          size="icon"
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        currentDate={currentDate}
        schedules={list}
        onDateClick={handleDateClick}
        onScheduleClick={handleScheduleClick}
        loading={loading}
      />

      {/* Schedule Form Modal */}
      <ScheduleFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        schedule={editingSchedule}
        initialDate={selectedDate}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Daily Event Drawer */}
      {selectedDate && (
        <DailyEventDrawer
          date={selectedDate}
          schedules={list.filter((schedule) => {
            const scheduleDate = new Date(schedule.start_datetime);
            return (
              scheduleDate.getDate() === selectedDate.getDate() &&
              scheduleDate.getMonth() === selectedDate.getMonth() &&
              scheduleDate.getFullYear() === selectedDate.getFullYear()
            );
          })}
          onClose={handleCloseDrawer}
          onAddSchedule={handleAddSchedule}
          onScheduleClick={handleScheduleClick}
        />
      )}

      {/* Event Detail Modal */}
      {selectedSchedule && (
        <EventDetailModal
          schedule={selectedSchedule}
          onClose={handleCloseEventDetail}
          onEdit={handleEditSchedule}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              Hapus Jadwal?
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Apakah Anda yakin ingin menghapus jadwal &quot;
              {scheduleToDelete?.title}&quot;? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
