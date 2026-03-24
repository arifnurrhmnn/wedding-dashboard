"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchVendorDetail,
  updateVendor,
  deleteVendor,
  clearSelectedVendor,
  Vendor,
} from "@/redux/slices/vendorSlice";
import { VendorFormModal } from "../components/VendorFormModal";
import { ProfilTab } from "./components/ProfilTab";
import { PackageTab } from "./components/PackageTab";
import { ActivityLogTab } from "./components/ActivityLogTab";
import { DokumenTab } from "./components/DokumenTab";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  User2,
  Package,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

type TabKey = "profil" | "paket" | "log" | "dokumen";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "profil", label: "Profil", icon: User2 },
  { key: "paket", label: "Paket", icon: Package },
  { key: "log", label: "Log Aktivitas", icon: Clock },
  { key: "dokumen", label: "Dokumen", icon: FileText },
];

export default function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selectedVendor: vendor, detailLoading } = useAppSelector(
    (state) => state.vendor
  );

  const [activeTab, setActiveTab] = useState<TabKey>("profil");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchVendorDetail(id));
    return () => {
      dispatch(clearSelectedVendor());
    };
  }, [dispatch, id]);

  const handleUpdate = async (data: Omit<Vendor, "id">) => {
    try {
      await dispatch(updateVendor({ id, data })).unwrap();
      toast.success("Vendor diperbarui");
      setEditModalOpen(false);
      dispatch(fetchVendorDetail(id));
    } catch {
      toast.error("Gagal memperbarui vendor");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteVendor(id)).unwrap();
      toast.success("Vendor dihapus");
      router.push("/dashboard/vendor");
    } catch {
      toast.error("Gagal menghapus vendor");
      setDeleting(false);
    }
  };

  if (detailLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Memuat data vendor...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Vendor tidak ditemukan.</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/vendor")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[vendor.status] ?? STATUS_CONFIG.prospek;
  const icon = CATEGORY_ICONS[vendor.kategori] ?? "🔆";

  const tabBadge: Partial<Record<TabKey, number>> = {
    paket: vendor.vendor_packages?.length ?? 0,
    log: vendor.vendor_activity_logs?.length ?? 0,
    dokumen: vendor.vendor_documents?.length ?? 0,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back + Delete */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/vendor")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Kembali
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Hapus Vendor
        </Button>
      </div>

      {/* Hero Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="text-5xl shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">
                {vendor.nama}
              </h1>
              <span
                className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full",
                  statusCfg.className
                )}
              >
                {statusCfg.label}
              </span>
            </div>
            <p className="text-muted-foreground">{vendor.kategori}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{vendor.vendor_packages?.length ?? 0} paket</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {vendor.vendor_activity_logs?.length ?? 0} aktivitas
                </span>
              </div>
              {vendor.vendor_packages?.find((p) => p.is_final) && (
                <div className="flex items-center gap-1.5 text-primary font-medium">
                  <span>
                    💰{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      vendor.vendor_packages.find((p) => p.is_final)!.harga
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Tab Nav */}
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const count = tabBadge[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {typeof count === "number" && count > 0 && (
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profil" && (
            <ProfilTab vendor={vendor} onEdit={() => setEditModalOpen(true)} />
          )}
          {activeTab === "paket" && (
            <PackageTab
              vendorId={vendor.id}
              packages={vendor.vendor_packages ?? []}
              vendorStatus={vendor.status}
            />
          )}
          {activeTab === "log" && (
            <ActivityLogTab
              vendorId={vendor.id}
              logs={vendor.vendor_activity_logs ?? []}
            />
          )}
          {activeTab === "dokumen" && (
            <DokumenTab
              vendorId={vendor.id}
              documents={vendor.vendor_documents ?? []}
            />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <VendorFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        vendor={vendor}
        onSubmit={handleUpdate}
      />

      {/* Delete Confirm */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Hapus Vendor?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Vendor{" "}
            <span className="font-semibold text-foreground">{vendor.nama}</span>{" "}
            beserta semua paket, dokumen, dan log aktivitasnya akan dihapus
            secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
