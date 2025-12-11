"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChecklistTask } from "@/redux/slices/checklistSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ChevronDown, Calendar } from "lucide-react";
import {
  CHECKLIST_CATEGORY_OPTIONS,
  CHECKLIST_STATUS_OPTIONS,
  CHECKLIST_PRIORITY_OPTIONS,
  CHECKLIST_TIMELINE_OPTIONS,
} from "@/utils/constants";
import { cn } from "@/lib/utils";

const getCategoryColor = (value: string) => {
  const colors: Record<string, string> = {
    documentation: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    venue: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    vendor: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    fashion: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    family: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    administration: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    ceremony: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    gifts: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
    prewedd: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    other: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };
  return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
};

const getStatusColor = (value: string) => {
  const colors: Record<string, string> = {
    todo: "bg-gray-500/15 text-gray-400 border-gray-500/30",
    in_progress: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    done: "bg-green-500/15 text-green-400 border-green-500/30",
  };
  return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
};

const getPriorityColor = (value: string) => {
  const colors: Record<string, string> = {
    low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    high: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
};

export const createColumns = (
  onInlineUpdate: (id: string, field: string, value: string | number) => void,
  onEdit: (item: ChecklistTask) => void,
  onDelete: (item: ChecklistTask) => void
): ColumnDef<ChecklistTask>[] => [
  {
    accessorKey: "title",
    header: "Task",
    size: 300,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="font-medium text-foreground">
          {row.getValue("title")}
        </div>
        {row.original.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {row.original.description}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Kategori",
    size: 180,
    enableResizing: false,
    cell: ({ row }) => {
      const item = row.original;
      const option = CHECKLIST_CATEGORY_OPTIONS.find(
        (opt) => opt.value === item.category
      );
      return (
        <Select
          value={item.category}
          onValueChange={(value) => onInlineUpdate(item.id, "category", value)}
        >
          <SelectTrigger className="w-fit h-auto border-0! ring-0! bg-transparent hover:bg-transparent p-0 gap-0">
            <Badge
              className={cn(
                "font-medium border gap-1.5 px-3 py-1.5 pr-2",
                getCategoryColor(item.category)
              )}
            >
              {option?.label}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Badge>
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {CHECKLIST_CATEGORY_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "cursor-pointer my-1 rounded-md",
                  item.category === opt.value && "font-bold"
                )}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "timeline_phase",
    header: "Fase",
    size: 200,
    enableResizing: false,
    cell: ({ row }) => {
      const item = row.original;
      const option = CHECKLIST_TIMELINE_OPTIONS.find(
        (opt) => opt.value === item.timeline_phase
      );
      return (
        <div className="text-sm text-muted-foreground">
          {option?.label || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 140,
    enableResizing: false,
    cell: ({ row }) => {
      const item = row.original;
      const option = CHECKLIST_STATUS_OPTIONS.find(
        (opt) => opt.value === item.status
      );
      return (
        <Select
          value={item.status}
          onValueChange={(value) => onInlineUpdate(item.id, "status", value)}
        >
          <SelectTrigger className="w-fit h-auto border-0! ring-0! bg-transparent hover:bg-transparent p-0 gap-0">
            <Badge
              className={cn(
                "font-medium border gap-1.5 px-3 py-1.5 pr-2",
                getStatusColor(item.status)
              )}
            >
              {option?.label}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Badge>
          </SelectTrigger>
          <SelectContent className="min-w-32">
            {CHECKLIST_STATUS_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "cursor-pointer my-1 rounded-md",
                  item.status === opt.value && "font-bold"
                )}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Prioritas",
    size: 120,
    enableResizing: false,
    cell: ({ row }) => {
      const item = row.original;
      const option = CHECKLIST_PRIORITY_OPTIONS.find(
        (opt) => opt.value === item.priority
      );
      return (
        <Badge
          className={cn(
            "font-medium border px-3 py-1.5",
            getPriorityColor(item.priority)
          )}
        >
          {option?.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    size: 140,
    enableResizing: false,
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date") as string;
      if (!dueDate) {
        return <span className="text-sm text-muted-foreground italic">-</span>;
      }
      const date = new Date(dueDate);
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    size: 100,
    enableResizing: false,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
