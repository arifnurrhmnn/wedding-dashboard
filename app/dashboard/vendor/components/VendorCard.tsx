"use client";

import { Vendor } from "@/redux/slices/vendorSlice";
import { cn } from "@/lib/utils";
import { Phone, Instagram, Globe, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG = {
  prospek: { label: "Prospek", className: "bg-muted text-muted-foreground" },
  negosiasi: {
    label: "Negosiasi",
    className: "bg-yellow-500/20 text-yellow-400",
  },
  deal: { label: "Deal ✓", className: "bg-green-500/20 text-green-400" },
  batal: { label: "Batal", className: "bg-destructive/20 text-destructive" },
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

interface VendorCardProps {
  vendor: Vendor;
}

export function VendorCard({ vendor }: VendorCardProps) {
  const status = STATUS_CONFIG[vendor.status] ?? STATUS_CONFIG.prospek;
  const icon = CATEGORY_ICONS[vendor.kategori] ?? "🔆";
  const finalPkg = vendor.vendor_packages?.find((p) => p.is_final);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-2xl shrink-0">{icon}</div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">
              {vendor.nama}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {vendor.kategori}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full",
            status.className
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Paket Final */}
      {finalPkg ? (
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground">Paket Terpilih</p>
          <p className="text-sm font-semibold text-primary truncate">
            {finalPkg.nama_paket}
          </p>
          <p className="text-sm font-bold text-foreground">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(finalPkg.harga)}
          </p>
        </div>
      ) : vendor.vendor_packages && vendor.vendor_packages.length > 0 ? (
        <div className="bg-muted/40 rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {vendor.vendor_packages.length} paket tersedia · belum ada yang
            final
          </p>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-lg px-3 py-2">
          <p className="text-xs text-muted-foreground italic">
            Belum ada paket
          </p>
        </div>
      )}

      {/* Kontak */}
      <div className="space-y-1.5">
        {vendor.kontak_nama && (
          <p className="text-xs text-muted-foreground truncate">
            👤 {vendor.kontak_nama}
          </p>
        )}
        {vendor.kontak_wa && (
          <a
            href={`https://wa.me/${vendor.kontak_wa.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            <Phone className="h-3 w-3" />
            {vendor.kontak_wa}
          </a>
        )}
        <div className="flex gap-3">
          {vendor.instagram && (
            <a
              href={`https://instagram.com/${vendor.instagram.replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Instagram className="h-3 w-3" />
              {vendor.instagram}
            </a>
          )}
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              Website
            </a>
          )}
        </div>
      </div>

      {/* Rating */}
      {vendor.rating && (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < vendor.rating!
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <Link
        href={`/dashboard/vendor/${vendor.id}`}
        className="flex items-center justify-end gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-auto"
      >
        Lihat Detail
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
