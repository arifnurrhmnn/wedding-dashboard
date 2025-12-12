"use client";

import { Schedule } from "@/redux/slices/scheduleSlice";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  currentDate: Date;
  schedules: Schedule[];
  onDateClick: (date: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
  loading: boolean;
}

export function CalendarGrid({
  currentDate,
  schedules,
  onDateClick,
  onScheduleClick,
  loading,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create calendar days array
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.start_datetime);
      return (
        scheduleDate.getDate() === date.getDate() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            <p className="text-muted-foreground">Memuat kalender...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[120px] border-r border-b border-border bg-muted/20"
              />
            );
          }

          const daySchedules = getSchedulesForDate(date);
          const hasEvents = daySchedules.length > 0;
          const today = isToday(date);

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={cn(
                "min-h-[120px] border-r border-b border-border p-2 cursor-pointer transition-all hover:bg-accent/50",
                today && "bg-primary/5 ring-1 ring-primary/20"
              )}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                    today
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {date.getDate()}
                </span>
                {hasEvents && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {daySchedules.length}
                  </span>
                )}
              </div>

              {/* Event badges */}
              <div className="space-y-1">
                {daySchedules.slice(0, 3).map((schedule) => (
                  <button
                    key={schedule.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleClick(schedule);
                    }}
                    className="w-full text-left"
                  >
                    <Badge
                      className={cn(
                        "w-full justify-start text-xs truncate px-2 py-0.5 font-medium border",
                        "bg-primary/15 text-primary border-primary/30"
                      )}
                    >
                      <span className="truncate">{schedule.title}</span>
                    </Badge>
                  </button>
                ))}

                {daySchedules.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2 py-1">
                    +{daySchedules.length - 3} lainnya
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
