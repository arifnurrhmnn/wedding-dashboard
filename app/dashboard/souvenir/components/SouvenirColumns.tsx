"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Souvenir } from "@/redux/slices/souvenirSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import { SOUVENIR_STATUS_OPTIONS } from "@/utils/constants";
import { cn } from "@/lib/utils";

const getBadgeColor = (value: string) => {
  const colors: Record<string, string> = {
    "Belum Dibeli": "bg-red-500/15 text-red-400 border-red-500/30",
    "Sudah Dibeli": "bg-green-500/15 text-green-400 border-green-500/30",
  };
  return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
};

export const createColumns = (
  onInlineUpdate: (id: string, field: string, value: string | number) => void,
  onEdit: (item: Souvenir) => void,
  onDelete: (item: Souvenir) => void
): ColumnDef<Souvenir>[] => [
  {
    accessorKey: "nama_souvenir",
    header: "Nama Souvenir",
    enableResizing: false,
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.getValue("nama_souvenir")}
      </div>
    ),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    enableResizing: false,
    cell: ({ row }) => {
      const vendor = row.getValue("vendor") as string;
      return (
        <div className="font-medium text-foreground">
          {vendor || <span className="italic text-muted-foreground/50">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "status_pengadaan",
    header: "Status",
    size: 160,
    enableResizing: false,
    cell: ({ row }) => {
      const item = row.original;
      const option = SOUVENIR_STATUS_OPTIONS.find(
        (opt) => opt.value === item.status_pengadaan
      );
      return (
        <Select
          value={item.status_pengadaan}
          onValueChange={(value) =>
            onInlineUpdate(item.id, "status_pengadaan", value)
          }
        >
          <SelectTrigger className="w-fit h-auto border-0! ring-0! bg-transparent hover:bg-transparent p-0 gap-0">
            <Badge
              className={cn(
                "font-medium border gap-1.5 px-3 py-1.5 pr-2",
                getBadgeColor(item.status_pengadaan)
              )}
            >
              {option?.label}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Badge>
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {SOUVENIR_STATUS_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "cursor-pointer my-1 rounded-md",
                  item.status_pengadaan === opt.value && "font-bold"
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
    accessorKey: "harga_per_item",
    header: "Harga/Item",
    size: 160,
    enableResizing: false,
    cell: ({ row }) => {
      const harga = row.getValue("harga_per_item") as number;
      return (
        <div className="font-medium text-foreground">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(harga || 0)}
        </div>
      );
    },
  },
  {
    accessorKey: "jumlah",
    header: "Jumlah",
    size: 140,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("jumlah")}</div>
    ),
  },
  {
    accessorKey: "total_harga",
    header: "Total",
    size: 160,
    enableResizing: false,
    cell: ({ row }) => {
      const total = row.getValue("total_harga") as number;
      return (
        <div className="font-bold text-primary">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(total || 0)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    size: 80,
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
