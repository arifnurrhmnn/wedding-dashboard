"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock } from "lucide-react";
import { Schedule } from "@/redux/slices/scheduleSlice";

interface DailyEventDrawerProps {
  date: Date;
  schedules: Schedule[];
  onClose: () => void;
  onAddSchedule: (date: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
}

export function DailyEventDrawer({
  date,
  schedules,
  onClose,
  onAddSchedule,
  onScheduleClick,
}: DailyEventDrawerProps) {
  const formattedDate = date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    return (
      new Date(a.start_datetime).getTime() -
      new Date(b.start_datetime).getTime()
    );
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-border shadow-2xl bg-card">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="h-5 w-5" />
            <DialogTitle className="text-xl font-bold">
              {formattedDate}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add Schedule Button */}
          <Button
            onClick={() => {
              onClose();
              onAddSchedule(date);
            }}
            variant="outline"
            className="w-full border-dashed border-2 hover:bg-accent"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Jadwal
          </Button>

          {/* Schedule List */}
          {sortedSchedules.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Tidak ada jadwal untuk hari ini
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {sortedSchedules.map((schedule) => (
                <button
                  key={schedule.id}
                  onClick={() => {
                    onClose();
                    onScheduleClick(schedule);
                  }}
                  className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                >
                  <div className="space-y-2">
                    {/* Title */}
                    <h4 className="font-semibold text-foreground">
                      {schedule.title}
                    </h4>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatTime(schedule.start_datetime)}
                        {schedule.end_datetime &&
                          ` - ${formatTime(schedule.end_datetime)}`}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
