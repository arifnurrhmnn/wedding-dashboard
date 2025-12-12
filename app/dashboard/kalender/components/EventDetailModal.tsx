"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";
import { Schedule } from "@/redux/slices/scheduleSlice";

interface EventDetailModalProps {
  schedule: Schedule;
  onClose: () => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
}

export function EventDetailModal({
  schedule,
  onClose,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const startDateTime = formatDateTime(schedule.start_datetime);
  const endDateTime = schedule.end_datetime
    ? formatDateTime(schedule.end_datetime)
    : null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] border-border shadow-2xl bg-card">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-2xl font-bold text-foreground">
            {schedule.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Start Date & Time */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Mulai</p>
              <p className="text-foreground font-medium">
                {startDateTime.date}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{startDateTime.time}</span>
              </div>
            </div>
          </div>

          {/* End Date & Time */}
          {endDateTime && (
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Selesai
                </p>
                <p className="text-foreground font-medium">
                  {endDateTime.date}
                </p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{endDateTime.time}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose();
              onDelete(schedule);
            }}
            className="flex-1 h-11 border-border hover:bg-secondary text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose();
              onEdit(schedule);
            }}
            className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
