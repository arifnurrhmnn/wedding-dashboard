"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Seserahan } from "@/redux/slices/seserahanSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ChevronDown } from "lucide-react";
import {
  SESERAHAN_KATEGORI_OPTIONS,
  SESERAHAN_STATUS_OPTIONS,
} from "@/utils/constants";
import { cn } from "@/lib/utils";

const getBadgeColor = (type: string, value: string) => {
  if (type === "kategori") {
    const colors: Record<string, string> = {
      "Perlengkapan Ibadah":
        "bg-purple-500/15 text-purple-400 border-purple-500/30",
      "Body Care": "bg-pink-500/15 text-pink-400 border-pink-500/30",
      "Skin Care": "bg-rose-500/15 text-rose-400 border-rose-500/30",
      "Hair Care": "bg-violet-500/15 text-violet-400 border-violet-500/30",
      "Make Up": "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
      Toiletries: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      Pakaian: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      "Pakaian Dalam": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      Accessories: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      "Lain lain": "bg-gray-500/15 text-gray-400 border-gray-500/30",
    };
    return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
  }

  if (type === "status") {
    const colors: Record<string, string> = {
      "Belum Dibeli": "bg-red-500/15 text-red-400 border-red-500/30",
      "Sudah Dibeli": "bg-green-500/15 text-green-400 border-green-500/30",
    };
    return colors[value] || "bg-gray-500/15 text-gray-400 border-gray-500/30";
  }

  return "";
};

export const createColumns = (
  onInlineUpdate: (id: string, field: string, value: string | number) => void,
  onEdit: (item: Seserahan) => void,
  onDelete: (item: Seserahan) => void
): ColumnDef<Seserahan>[] => [
  {
    accessorKey: "nama_item",
    header: "Nama Item",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.getValue("nama_item")}
      </div>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      const brand = row.getValue("brand") as string;
      return (
        <div className="font-medium text-foreground">
          {brand || <span className="italic text-muted-foreground/50">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "kategori",
    header: "Kategori",
    size: 220,
    cell: ({ row }) => {
      const item = row.original;
      const option = SESERAHAN_KATEGORI_OPTIONS.find(
        (opt) => opt.value === item.kategori
      );
      return (
        <Select
          value={item.kategori}
          onValueChange={(value) => onInlineUpdate(item.id, "kategori", value)}
        >
          <SelectTrigger className="w-fit h-auto border-0! ring-0! bg-transparent hover:bg-transparent p-0 gap-0">
            <Badge
              className={cn(
                "font-medium border gap-1.5 px-3 py-1.5 pr-2",
                getBadgeColor("kategori", item.kategori)
              )}
            >
              {option?.label}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Badge>
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {SESERAHAN_KATEGORI_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "cursor-pointer my-1 rounded-md",
                  item.kategori === opt.value && "font-bold"
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
    accessorKey: "link_marketplace",
    header: "Link Marketplace",
    size: 180,
    cell: ({ row }) => {
      const link = row.getValue("link_marketplace") as string;
      if (link) {
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline text-sm"
          >
            Lihat Link
          </a>
        );
      }
      return <span className="italic text-muted-foreground/50">-</span>;
    },
  },
  {
    accessorKey: "status_pembelian",
    header: "Status",
    size: 160,
    cell: ({ row }) => {
      const item = row.original;
      const option = SESERAHAN_STATUS_OPTIONS.find(
        (opt) => opt.value === item.status_pembelian
      );
      return (
        <Select
          value={item.status_pembelian}
          onValueChange={(value) =>
            onInlineUpdate(item.id, "status_pembelian", value)
          }
        >
          <SelectTrigger className="w-fit h-auto border-0! ring-0! bg-transparent hover:bg-transparent p-0 gap-0">
            <Badge
              className={cn(
                "font-medium border gap-1.5 px-3 py-1.5 pr-2",
                getBadgeColor("status", item.status_pembelian)
              )}
            >
              {option?.label}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Badge>
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {SESERAHAN_STATUS_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className={cn(
                  "cursor-pointer my-1 rounded-md",
                  item.status_pembelian === opt.value && "font-bold"
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
    accessorKey: "harga",
    header: "Harga",
    size: 140,
    cell: ({ row }) => {
      const harga = row.getValue("harga") as number;
      return (
        <div className="font-bold text-primary">
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
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    size: 100,
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
