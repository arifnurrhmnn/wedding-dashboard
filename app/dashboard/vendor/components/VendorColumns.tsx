"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Vendor } from "@/redux/slices/vendorSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ArrowUpDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  prospek: {
    label: "Prospek",
    className: "bg-muted/60 text-muted-foreground border-border",
  },
  negosiasi: {
    label: "Negosiasi",
    className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  },
  deal: {
    label: "Deal ✓",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  batal: {
    label: "Batal",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  "Foto & Video": "📸",
  "Katering & Konsumsi": "🍽️",
  "Venue & Gedung": "🏛️",
  "Dekorasi & Florist": "💐",
  "Busana & Kebaya": "👗",
  "MUA (Make Up Artist)": "💄",
  "Entertainment & Band": "🎵",
  "Wedding Cake": "🎂",
  "Undangan & Percetakan": "💌",
  Transportasi: "🚗",
  "Wedding Organizer (WO)": "📋",
  Lainnya: "🔆",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export const createVendorColumns = (
  onEdit: (vendor: Vendor) => void,
  onDelete: (vendor: Vendor) => void
): ColumnDef<Vendor>[] => [
  {
    accessorKey: "nama",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 text-foreground/80 font-semibold hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Vendor
        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
      </button>
    ),
    cell: ({ row }) => {
      const vendor = row.original;
      const icon = CATEGORY_ICONS[vendor.kategori] ?? "🔆";
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0">{icon}</span>
          <div className="min-w-0">
            <Link
              href={`/dashboard/vendor/${vendor.id}`}
              className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
            >
              {vendor.nama}
            </Link>
            <p className="text-xs text-muted-foreground truncate">
              {vendor.kategori}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "kontak_nama",
    header: "Kontak",
    cell: ({ row }) => {
      const vendor = row.original;
      return (
        <div className="space-y-0.5">
          {vendor.kontak_nama ? (
            <p className="text-sm text-foreground">{vendor.kontak_nama}</p>
          ) : null}
          {vendor.kontak_wa ? (
            <a
              href={`https://wa.me/${vendor.kontak_wa.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              {vendor.kontak_wa}
            </a>
          ) : null}
          {!vendor.kontak_nama && !vendor.kontak_wa && (
            <span className="italic text-muted-foreground/50 text-sm">-</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 text-foreground/80 font-semibold hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
      </button>
    ),
    size: 140,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.prospek;
      return (
        <Badge className={cn("font-medium border text-xs", cfg.className)}>
          {cfg.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || value === "semua") return true;
      return row.getValue(id) === value;
    },
  },
  {
    id: "paket_final",
    header: "Paket Final",
    cell: ({ row }) => {
      const vendor = row.original;
      const finalPkg = vendor.vendor_packages?.find((p) => p.is_final);
      if (finalPkg) {
        return (
          <div>
            <p className="text-sm font-medium text-foreground truncate max-w-40">
              {finalPkg.nama_paket}
            </p>
            <p className="text-xs text-primary font-semibold">
              {fmt(finalPkg.harga)}
            </p>
          </div>
        );
      }
      const pkgCount = vendor.vendor_packages?.length ?? 0;
      return (
        <span className="text-sm italic text-muted-foreground/60">
          {pkgCount > 0 ? `${pkgCount} paket, belum final` : "Belum ada paket"}
        </span>
      );
    },
  },
  {
    id: "aksi",
    header: "Aksi",
    size: 120,
    cell: ({ row }) => {
      const vendor = row.original;
      return (
        <div className="flex items-center gap-1">
          <Link href={`/dashboard/vendor/${vendor.id}`}>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Detail"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(vendor)}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(vendor)}
            title="Hapus"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
