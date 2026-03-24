"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import {
  VendorActivityLog,
  addActivityLog,
  deleteActivityLog,
} from "@/redux/slices/vendorSlice";
import { toast } from "sonner";
import { Plus, Trash2, Clock, CalendarDays } from "lucide-react";

interface ActivityLogTabProps {
  vendorId: string;
  logs: VendorActivityLog[];
}

const AKTIVITAS_OPTIONS = [
  "Pertama kali dihubungi",
  "Kirim inquiry / price list",
  "Meeting / survei venue",
  "Terima penawaran harga",
  "Proses negosiasi harga",
  "Tanda tangan kontrak / deal",
  "Pembayaran DP",
  "Pelunasan",
  "Persiapan/koordinasi hari H",
  "Selesai / evaluasi",
  "Lainnya",
];

const getInitialForm = () => ({
  aktivitas: AKTIVITAS_OPTIONS[0],
  customAktivitas: "",
  tanggal: new Date().toISOString().slice(0, 10),
  catatan: "",
});

export function ActivityLogTab({ vendorId, logs }: ActivityLogTabProps) {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingLog, setDeletingLog] = useState<VendorActivityLog | null>(
    null
  );
  const [form, setForm] = useState(getInitialForm);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isCustom = form.aktivitas === "Lainnya";

  const handleOpenChange = (open: boolean) => {
    if (open) setForm(getInitialForm());
    setModalOpen(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aktivitasValue = isCustom ? form.customAktivitas : form.aktivitas;
    if (!aktivitasValue || !form.tanggal) return;
    setLoading(true);
    try {
      await dispatch(
        addActivityLog({
          vendorId,
          data: {
            aktivitas: aktivitasValue,
            tanggal: form.tanggal,
            catatan: form.catatan,
          },
        })
      ).unwrap();
      toast.success("Aktivitas berhasil dicatat!");
      setModalOpen(false);
    } catch {
      toast.error("Terjadi kesalahan!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLog) return;
    setLoading(true);
    try {
      await dispatch(
        deleteActivityLog({ vendorId, logId: deletingLog.id })
      ).unwrap();
      toast.success("Log berhasil dihapus!");
      setDeleteOpen(false);
      setDeletingLog(null);
    } catch {
      toast.error("Gagal menghapus log!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Log Aktivitas</h3>
          <p className="text-sm text-muted-foreground">
            {logs.length} aktivitas tercatat
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => handleOpenChange(true)}
          className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
        >
          <Plus className="h-4 w-4" />
          Catat Aktivitas
        </Button>
      </div>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Belum ada aktivitas dicatat
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Catat setiap interaksi penting dengan vendor ini
          </p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="relative group">
                <div className="absolute -left-[18px] top-2 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                <div className="bg-card border border-border rounded-lg px-4 py-3 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">
                        {log.aktivitas}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(log.tanggal)}
                      </div>
                      {log.catatan && (
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                          {log.catatan}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => {
                        setDeletingLog(log);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px] border-border shadow-2xl bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Catat Aktivitas
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Catat interaksi atau progress terbaru dengan vendor ini
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="aktivitas"
                  className="text-sm font-medium text-foreground"
                >
                  Jenis Aktivitas <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.aktivitas}
                  onValueChange={(v) => set("aktivitas", v)}
                >
                  <SelectTrigger
                    id="aktivitas"
                    className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                  >
                    <SelectValue placeholder="Pilih jenis aktivitas" />
                    <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    {AKTIVITAS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isCustom && (
                <div className="space-y-2">
                  <Label
                    htmlFor="customAktivitas"
                    className="text-sm font-medium text-foreground"
                  >
                    Keterangan Aktivitas{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customAktivitas"
                    value={form.customAktivitas}
                    onChange={(e) => set("customAktivitas", e.target.value)}
                    className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                    placeholder="Tulis aktivitas secara spesifik..."
                    required={isCustom}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="tanggal"
                  className="text-sm font-medium text-foreground"
                >
                  Tanggal <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => set("tanggal", e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="catatan"
                  className="text-sm font-medium text-foreground"
                >
                  Catatan
                </Label>
                <textarea
                  id="catatan"
                  value={form.catatan}
                  onChange={(e) => set("catatan", e.target.value)}
                  className="w-full min-h-20 px-3 py-2 text-sm bg-input border border-input rounded-md shadow-xs placeholder:text-muted-foreground outline-none transition-[color,box-shadow] resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  placeholder="Detail percakapan, kesepakatan, dll... (opsional)"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1 h-11 border-border hover:bg-secondary"
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </div>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[450px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Konfirmasi Hapus
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus log aktivitas{" "}
              <span className="font-bold text-destructive">
                {deletingLog?.aktivitas}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 h-11 bg-destructive hover:bg-destructive/90 text-white font-medium shadow-md"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghapus...
                </div>
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
