"use client";

import { useState } from "react";
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
import { Schedule } from "@/redux/slices/scheduleSlice";

interface ScheduleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule?: Schedule | null;
  initialDate?: Date | null;
  onSubmit: (data: Omit<Schedule, "id" | "created_at" | "updated_at">) => void;
  loading: boolean;
}

const getInitialFormData = (
  schedule: Schedule | null | undefined,
  initialDate: Date | null | undefined
) => {
  if (schedule) {
    // Parse datetime for editing
    const startDate = new Date(schedule.start_datetime);
    const endDate = schedule.end_datetime
      ? new Date(schedule.end_datetime)
      : null;

    return {
      title: schedule.title,
      start_date: startDate.toISOString().split("T")[0],
      start_time: startDate.toTimeString().slice(0, 5),
      end_date: endDate ? endDate.toISOString().split("T")[0] : "",
      end_time: endDate ? endDate.toTimeString().slice(0, 5) : "",
    };
  }

  // For new schedule with initial date
  if (initialDate) {
    return {
      title: "",
      start_date: initialDate.toISOString().split("T")[0],
      start_time: "09:00",
      end_date: "",
      end_time: "",
    };
  }

  // Default new schedule
  return {
    title: "",
    start_date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_date: "",
    end_time: "",
  };
};

export function ScheduleFormModal({
  open,
  onOpenChange,
  schedule,
  initialDate,
  onSubmit,
  loading,
}: ScheduleFormModalProps) {
  const [formData, setFormData] = useState(() =>
    getInitialFormData(schedule, initialDate)
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData(getInitialFormData(schedule, initialDate));
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine date and time
    const start_datetime = `${formData.start_date}T${formData.start_time}:00`;
    const end_datetime =
      formData.end_date && formData.end_time
        ? `${formData.end_date}T${formData.end_time}:00`
        : undefined;

    onSubmit({
      title: formData.title,
      start_datetime,
      end_datetime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {schedule ? "Edit" : "Tambah"} Jadwal
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {schedule
              ? "Update jadwal pernikahan Anda"
              : "Tambahkan jadwal persiapan pernikahan baru"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-foreground"
              >
                Judul Jadwal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Contoh: Meeting dengan Wedding Organizer"
                required
                className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
              />
            </div>
            {/* Start Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="start_date"
                  className="text-sm font-medium text-foreground"
                >
                  Tanggal Mulai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="start_time"
                  className="text-sm font-medium text-foreground"
                >
                  Waktu Mulai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  required
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                />
              </div>
            </div>{" "}
            {/* End Date & Time (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="end_date"
                  className="text-sm font-medium text-foreground"
                >
                  Tanggal Selesai
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="end_time"
                  className="text-sm font-medium text-foreground"
                >
                  Waktu Selesai
                </Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                />
              </div>
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
              ) : schedule ? (
                "Update"
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
