"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Guest } from "@/redux/slices/guestSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ChevronDown } from "lucide-react";
import {
  KATEGORI_OPTIONS,
  SKALA_PRIORITAS_OPTIONS,
  TIPE_UNDANGAN_OPTIONS,
} from "@/utils/constants";
import { cn } from "@/lib/utils";

const getBadgeColor = (type: string, value: string) => {
  if (type === "kategori") {
    const colors: Record<string, string> = {
      "Keluarga Inti": "bg-blue-500/15 text-blue-400 border-blue-500/30",
      "Keluarga Besar": "bg-purple-500/15 text-purple-400 border-purple-500/30",
      Teman: "bg-green-500/15 text-green-400 border-green-500/30",
      Kolega: "bg-orange-500/15 text-orange-400 border-orange-500/30",
      Tetangga: "bg-teal-500/15 text-teal-400 border-teal-500/30",
      "Tamu Orang Tua": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    };
    return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
  }

  if (type === "skala_prioritas") {
    const colors: Record<string, string> = {
      "Wajib Hadir": "bg-red-500/15 text-red-400 border-red-500/30",
      Penting: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      Cadangan: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    };
    return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
  }

  if (type === "tipe_undangan") {
    const colors: Record<string, string> = {
      Digital: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      Cetak: "bg-pink-500/15 text-pink-400 border-pink-500/30",
      Kabar: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    };
    return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
  }

  return "";
};

export const createColumns = (
  onInlineUpdate: (id: string, field: string, value: string) => void,
  onEdit: (guest: Guest) => void
): ColumnDef<Guest>[] => [
  {
    accessorKey: "nama",
    header: "Nama",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("nama")}</div>
    ),
  },
  {
    accessorKey: "qty",
    header: "Qty",
    size: 120,
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.getValue("qty")}</div>
    ),
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    size: 200,
    cell: ({ row }) => {
      const guest = row.original;
      const option = KATEGORI_OPTIONS.find(
        (opt) => opt.value === guest.kategori
      );
      return (
        <Select
          value={guest.kategori}
          onValueChange={(value) => onInlineUpdate(guest.id, "kategori", value)}
        >
          <SelectTrigger className="w-fit h-auto border-0! ring-0! bg-transparent hover:bg-transparent p-0 gap-0">
            <Badge
              className={cn(
                "font-medium border gap-1.5 px-3 py-1.5 pr-2",
                getBadgeColor("kategori", guest.kategori)
              )}
            >
              {option?.label}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Badge>
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {KATEGORI_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "cursor-pointer my-1 rounded-md",
                  guest.kategori === opt.value && "font-bold"
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
    accessorKey: "skala_prioritas",
    header: "Skala Prioritas",
    size: 200,
    cell: ({ row }) => {
      const guest = row.original;
      const option = SKALA_PRIORITAS_OPTIONS.find(
        (opt) => opt.value === guest.skala_prioritas
      );
      return (
        <Select
          value={guest.skala_prioritas}
          onValueChange={(value) =>
            onInlineUpdate(guest.id, "skala_prioritas", value)
          }
        >
          <SelectTrigger className="w-fit h-auto border-0! ring-0! bg-transparent hover:bg-transparent p-0 gap-0">
            <Badge
              className={cn(
                "font-medium border gap-1.5 px-3 py-1.5 pr-2",
                getBadgeColor("skala_prioritas", guest.skala_prioritas)
              )}
            >
              {option?.label}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Badge>
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {SKALA_PRIORITAS_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "cursor-pointer my-1 rounded-md",
                  guest.skala_prioritas === opt.value && "font-bold"
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
    accessorKey: "tipe_undangan",
    header: "Tipe Undangan",
    size: 200,
    cell: ({ row }) => {
      const guest = row.original;
      const option = TIPE_UNDANGAN_OPTIONS.find(
        (opt) => opt.value === guest.tipe_undangan
      );
      return (
        <Select
          value={guest.tipe_undangan}
          onValueChange={(value) =>
            onInlineUpdate(guest.id, "tipe_undangan", value)
          }
        >
          <SelectTrigger className="w-fit h-auto border-0! ring-0! bg-transparent hover:bg-transparent p-0 gap-0">
            <Badge
              className={cn(
                "font-medium border gap-1.5 px-3 py-1.5 pr-2",
                getBadgeColor("tipe_undangan", guest.tipe_undangan)
              )}
            >
              {option?.label}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Badge>
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {TIPE_UNDANGAN_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "cursor-pointer my-1 rounded-md",
                  guest.tipe_undangan === opt.value && "font-bold"
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
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    size: 80,
    cell: ({ row }) => {
      const guest = row.original;
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(guest)}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
