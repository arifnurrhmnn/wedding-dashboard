"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Vendor } from "@/redux/slices/vendorSlice";
import { useAppDispatch } from "@/redux/hooks";
import { updateVendorStatus } from "@/redux/slices/vendorSlice";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  Globe,
  Instagram,
  MapPin,
  User,
  StickyNote,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  prospek: {
    label: "Prospek",
    className: "bg-muted text-muted-foreground",
    description: "Vendor potensial, belum dihubungi secara serius",
  },
  negosiasi: {
    label: "Negosiasi",
    className: "bg-yellow-500/20 text-yellow-400",
    description: "Sedang dalam proses diskusi dan tawar-menawar harga",
  },
  deal: {
    label: "Deal ✓",
    className: "bg-green-500/20 text-green-400",
    description: "Kontrak sudah disepakati / ditandatangani",
  },
  batal: {
    label: "Batal",
    className: "bg-destructive/20 text-destructive",
    description: "Tidak jadi menggunakan vendor ini",
  },
};

const STATUS_FLOW: Array<keyof typeof STATUS_CONFIG> = [
  "prospek",
  "negosiasi",
  "deal",
];

interface ProfilTabProps {
  vendor: Vendor;
  onEdit: () => void;
}

export function ProfilTab({ vendor, onEdit }: ProfilTabProps) {
  const dispatch = useAppDispatch();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusCfg = STATUS_CONFIG[vendor.status] ?? STATUS_CONFIG.prospek;

  const handleStatusChange = async (newStatus: Vendor["status"]) => {
    if (newStatus === vendor.status) return;
    setUpdatingStatus(true);
    try {
      await dispatch(
        updateVendorStatus({ id: vendor.id, status: newStatus })
      ).unwrap();
      toast.success(`Status diperbarui ke "${STATUS_CONFIG[newStatus].label}"`);
    } catch {
      toast.error("Gagal memperbarui status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    href,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    href?: string;
  }) => (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-foreground wrap-break-word">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Flow */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-foreground">
            Status Vendor
          </h3>
        </div>

        {/* Flow steps */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FLOW.map((s, i) => {
            const cfg = STATUS_CONFIG[s];
            const isActive = vendor.status === s;
            const isPassed =
              vendor.status !== "batal" &&
              STATUS_FLOW.indexOf(vendor.status as keyof typeof STATUS_CONFIG) >
                i;
            return (
              <div key={s} className="flex items-center gap-1">
                <button
                  disabled={updatingStatus || vendor.status === "batal"}
                  onClick={() => handleStatusChange(s)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    isActive
                      ? cfg.className
                      : isPassed
                      ? "bg-primary/20 text-primary cursor-default"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted",
                    updatingStatus && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {cfg.label}
                </button>
                {i < STATUS_FLOW.length - 1 && (
                  <span className="text-muted-foreground/40 text-xs">→</span>
                )}
              </div>
            );
          })}
          {/* Batal */}
          <button
            disabled={updatingStatus || vendor.status === "batal"}
            onClick={() => handleStatusChange("batal")}
            className={cn(
              "ml-2 px-3 py-1 rounded-full text-xs font-semibold transition-all",
              vendor.status === "batal"
                ? STATUS_CONFIG.batal.className
                : "bg-muted/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              updatingStatus && "opacity-50 cursor-not-allowed"
            )}
          >
            Batal
          </button>
        </div>

        <p className="text-xs text-muted-foreground italic">
          {statusCfg.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kontak */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm text-foreground">
            Informasi Kontak
          </h3>
          <div className="space-y-3">
            {vendor.kontak_nama && (
              <InfoRow
                icon={User}
                label="Nama PIC"
                value={vendor.kontak_nama}
              />
            )}
            {vendor.kontak_wa && (
              <InfoRow
                icon={Phone}
                label="WhatsApp"
                value={vendor.kontak_wa}
                href={`https://wa.me/${vendor.kontak_wa.replace(/\D/g, "")}`}
              />
            )}
            {vendor.kontak_email && (
              <InfoRow
                icon={Mail}
                label="Email"
                value={vendor.kontak_email}
                href={`mailto:${vendor.kontak_email}`}
              />
            )}
            {vendor.instagram && (
              <InfoRow
                icon={Instagram}
                label="Instagram"
                value={vendor.instagram}
                href={`https://instagram.com/${vendor.instagram.replace(
                  "@",
                  ""
                )}`}
              />
            )}
            {vendor.website && (
              <InfoRow
                icon={Globe}
                label="Website"
                value={vendor.website}
                href={vendor.website}
              />
            )}
            {vendor.alamat && (
              <InfoRow icon={MapPin} label="Alamat" value={vendor.alamat} />
            )}
            {!vendor.kontak_nama &&
              !vendor.kontak_wa &&
              !vendor.kontak_email &&
              !vendor.instagram &&
              !vendor.website &&
              !vendor.alamat && (
                <p className="text-sm text-muted-foreground italic">
                  Belum ada informasi kontak
                </p>
              )}
          </div>
        </div>

        {/* Catatan */}
        {vendor.catatan ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Catatan</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {vendor.catatan}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm text-foreground">Catatan</h3>
            </div>
            <p className="text-sm text-muted-foreground italic">
              Belum ada catatan
            </p>
          </div>
        )}
      </div>

      {/* Edit Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={onEdit}>
          Edit Informasi Vendor
        </Button>
      </div>
    </div>
  );
}
