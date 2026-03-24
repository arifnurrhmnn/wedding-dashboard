"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchGuests, setGuestInvited, Guest } from "@/redux/slices/guestSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  X,
  ListFilter,
  Copy,
  Check,
  Mail,
  Settings2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/lib/axiosClient";
import { KATEGORI_OPTIONS } from "@/utils/constants";
import { cn } from "@/lib/utils";

const DEFAULT_TEMPLATE = `Assalamu'alaikum Wr. Wb.

Yth. *{nama} & Partner*

Dengan penuh rasa syukur dan tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/I untuk hadir dan turut merayakan hari bahagia pernikahan kami.

Untuk detail rangkaian acara, lokasi, serta informasi lain dapat diakses melalui tautan berikut ini.

Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberi doa restu. Mohon maaf jika undangan ini kami sampaikan secara digital.

Atas waktu dan perhatiannya, kami ucapkan terima kasih.

Wassalamu'alaikum Wr. Wb.`;

// Sisipkan zero-width space setelah titik agar gelar tidak dideteksi WhatsApp sebagai URL/link
const safeNama = (nama: string) => nama.replace(/\./g, ".\u200B");

const buildWaMessage = (template: string, nama: string): string => {
  const safe = safeNama(nama);
  return template.replace(/\{nama\}/g, safe);
};

const KATEGORI_BADGE: Record<string, string> = {
  "Keluarga Inti": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Keluarga Besar": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Teman: "bg-green-500/15 text-green-400 border-green-500/30",
  Kolega: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Tetangga: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Tamu Orang Tua": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

const PAGE_SIZE = 10;

export default function UndanganTamuPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.guests);

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterUndangan, setFilterUndangan] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Template WA state
  const [waTemplate, setWaTemplate] = useState(DEFAULT_TEMPLATE);
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchGuests());
    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchTemplate = useCallback(async () => {
    setTemplateLoading(true);
    try {
      const res = await axiosClient.get("/wa-settings");
      setWaTemplate(res.data.template_pesan);
      setIsCustomTemplate(res.data.is_custom);
    } catch {
      // Gunakan default template jika gagal fetch
      setWaTemplate(DEFAULT_TEMPLATE);
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  const handleOpenTemplateDialog = () => {
    setEditTemplate(waTemplate);
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!editTemplate.includes("{nama}")) {
      toast.error(
        "Template harus mengandung {nama} sebagai placeholder nama tamu!"
      );
      return;
    }
    setTemplateSaving(true);
    try {
      const res = await axiosClient.patch("/wa-settings", {
        template_pesan: editTemplate,
      });
      setWaTemplate(res.data.template_pesan);
      setIsCustomTemplate(true);
      setTemplateDialogOpen(false);
      toast.success("Template pesan WA berhasil disimpan!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Gagal menyimpan template";
      toast.error(msg);
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleResetTemplate = () => {
    setEditTemplate(DEFAULT_TEMPLATE);
  };

  const resetPage = () => setCurrentPage(1);

  const handleSearch = (v: string) => {
    setSearch(v);
    resetPage();
  };
  const handleFilterKategori = (v: string) => {
    setFilterKategori(v);
    resetPage();
  };
  const handleFilterUndangan = (v: string) => {
    setFilterUndangan(v);
    resetPage();
  };

  // Toggle is_invited langsung dari checkbox
  const handleToggleInvited = async (guest: Guest) => {
    const newValue = !guest.is_invited;
    setUpdatingId(guest.id);
    dispatch(setGuestInvited({ id: guest.id, is_invited: newValue }));
    try {
      await axiosClient.patch(`/tamu-undangan/${guest.id}`, {
        is_invited: newValue,
      });
      toast.success(
        newValue
          ? `${guest.nama} sudah diundang ✓`
          : `${guest.nama} ditandai belum diundang`
      );
    } catch {
      dispatch(setGuestInvited({ id: guest.id, is_invited: !newValue }));
      toast.error("Gagal memperbarui status undangan");
    } finally {
      setUpdatingId(null);
    }
  };

  // Copy pesan WA menggunakan template yang disimpan
  const handleCopy = async (guest: Guest) => {
    const pesan = buildWaMessage(waTemplate, guest.nama);
    try {
      await navigator.clipboard.writeText(pesan);
      setCopiedId(guest.id);
      toast.success(`Pesan undangan untuk ${guest.nama} berhasil disalin!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Gagal menyalin pesan");
    }
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return list.filter((g) => {
      const matchSearch =
        search.trim() === "" ||
        g.nama.toLowerCase().includes(search.toLowerCase());
      const matchKategori =
        filterKategori === "all" || g.kategori === filterKategori;
      const matchUndangan =
        filterUndangan === "all" ||
        (filterUndangan === "sudah" ? !!g.is_invited : !g.is_invited);
      return matchSearch && matchKategori && matchUndangan;
    });
  }, [list, search, filterKategori, filterUndangan]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const paginatedList = filteredList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalSudah = useMemo(
    () => list.filter((g) => !!g.is_invited).length,
    [list]
  );
  const totalBelum = useMemo(
    () => list.filter((g) => !g.is_invited).length,
    [list]
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Undangan Tamu
            </h1>
            <p className="text-muted-foreground">
              Kelola status pengiriman undangan kepada tamu
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleOpenTemplateDialog}
            disabled={templateLoading}
            className="gap-2 h-10 border-border hover:bg-primary/10 hover:text-primary hover:border-primary"
          >
            {templateLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Settings2 className="h-4 w-4" />
            )}
            Edit Template WA
            {isCustomTemplate && (
              <span
                className="ml-1 w-2 h-2 rounded-full bg-primary inline-block"
                title="Custom template aktif"
              />
            )}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-4">
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Tamu</p>
              <p className="text-2xl font-bold text-foreground">
                {list.length}
              </p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sudah Diundang</p>
              <p className="text-2xl font-bold text-green-500">{totalSudah}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Belum Diundang</p>
              <p className="text-2xl font-bold text-orange-500">{totalBelum}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card border border-border rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama tamu..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 h-10 bg-input border-border focus:border-primary focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={filterKategori} onValueChange={handleFilterKategori}>
            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-input border-border">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Kategori" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {KATEGORI_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterUndangan} onValueChange={handleFilterUndangan}>
            <SelectTrigger className="w-full sm:w-[190px] h-10 bg-input border-border">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Status Undangan" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="sudah">Sudah Diundang</SelectItem>
              <SelectItem value="belum">Belum Diundang</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {loading && list.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="inline-block h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-border bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-foreground/80 font-semibold h-14 text-xs uppercase tracking-wider">
                      Nama
                    </TableHead>
                    <TableHead className="text-foreground/80 font-semibold h-14 text-xs uppercase tracking-wider">
                      Kategori
                    </TableHead>
                    <TableHead className="text-foreground/80 font-semibold h-14 text-xs uppercase tracking-wider text-center">
                      Diundang
                    </TableHead>
                    <TableHead className="text-foreground/80 font-semibold h-14 text-xs uppercase tracking-wider text-center">
                      Copy Pesan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.length > 0 ? (
                    paginatedList.map((guest) => (
                      <TableRow
                        key={guest.id}
                        className="border-b border-border hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="py-4 font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            {guest.nama}
                            {guest.is_invited && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-500">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            className={cn(
                              "font-medium border px-3 py-1",
                              KATEGORI_BADGE[guest.kategori] ??
                                "bg-gray-500/15 text-gray-400 border-gray-500/30"
                            )}
                          >
                            {guest.kategori}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleToggleInvited(guest)}
                                disabled={updatingId === guest.id}
                                className={cn(
                                  "w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all duration-150",
                                  guest.is_invited
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-border bg-background hover:border-primary",
                                  updatingId === guest.id &&
                                    "opacity-50 cursor-wait"
                                )}
                              >
                                {guest.is_invited && (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {guest.is_invited
                                ? "Klik untuk tandai belum diundang"
                                : "Klik untuk tandai sudah diundang"}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopy(guest)}
                                className={cn(
                                  "h-8 w-8 mx-auto transition-all",
                                  copiedId === guest.id
                                    ? "text-green-500 hover:text-green-500 hover:bg-green-500/10"
                                    : "hover:bg-primary/10 hover:text-primary"
                                )}
                              >
                                {copiedId === guest.id ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {copiedId === guest.id
                                ? "Tersalin!"
                                : "Copy pesan undangan WA"}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <Mail className="h-10 w-10 opacity-30" />
                          <p className="text-base font-medium">
                            Tidak ada data ditemukan.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredList.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-muted-foreground">
              Halaman {currentPage} dari {totalPages} &nbsp;·&nbsp;{" "}
              {filteredList.length} tamu
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 px-4 border-border hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="h-9 px-4 border-border hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Dialog Edit Template WA */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="max-w-[90vw]! w-[900px] border-border shadow-2xl bg-card">
            <DialogHeader className="space-y-2 pb-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Edit Template Pesan WA
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Gunakan{" "}
                <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono">
                  {"{nama}"}
                </code>{" "}
                sebagai placeholder — akan diganti otomatis dengan nama tamu
                saat menyalin pesan.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {/* 2 kolom: textarea kiri, preview kanan */}
              <div className="grid grid-cols-2 gap-4">
                {/* Kiri: Editor */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Template Pesan <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={editTemplate}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setEditTemplate(e.target.value)
                    }
                    rows={18}
                    className="w-full bg-input border-border focus:border-primary focus:ring-primary/20 font-mono text-sm resize-none"
                    placeholder="Tulis template pesan WA..."
                  />
                  {!editTemplate.includes("{nama}") &&
                    editTemplate.length > 0 && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        ⚠ Template harus mengandung{" "}
                        <code className="font-mono">{"{nama}"}</code>
                      </p>
                    )}
                </div>

                {/* Kanan: Preview */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Preview —{" "}
                    <span className="text-primary normal-case font-normal">
                      contoh: Budi Santoso
                    </span>
                  </Label>
                  <div
                    className="h-full min-h-[300px] bg-[#e5ddd5] rounded-lg p-3 overflow-y-auto"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}
                  >
                    {editTemplate ? (
                      <div className="inline-block max-w-[85%] bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {buildWaMessage(editTemplate, "Budi Santoso")}
                        <div className="text-[10px] text-gray-400 text-right mt-1">
                          12:00 ✓✓
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm italic">
                        Tulis template untuk melihat preview
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetTemplate}
                className="gap-2 text-muted-foreground hover:text-foreground"
                disabled={templateSaving}
              >
                <RotateCcw className="h-4 w-4" />
                Reset Default
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={() => setTemplateDialogOpen(false)}
                disabled={templateSaving}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={templateSaving || !editTemplate.includes("{nama}")}
                className="bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
              >
                {templateSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Template"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
