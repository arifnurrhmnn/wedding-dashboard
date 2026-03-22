"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchGuests, Guest } from "@/redux/slices/guestSlice";
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
import { Search, X, ListFilter, Pencil, Gift } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/lib/axiosClient";
import { KATEGORI_OPTIONS, GIFT_TYPE_OPTIONS } from "@/utils/constants";
import { cn } from "@/lib/utils";
import { GiftFormModal } from "./components/GiftFormModal";

const KATEGORI_BADGE: Record<string, string> = {
  "Keluarga Inti": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Keluarga Besar": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Teman: "bg-green-500/15 text-green-400 border-green-500/30",
  Kolega: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Tetangga: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Tamu Orang Tua": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

const GIFT_TYPE_BADGE: Record<string, string> = {
  uang: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  kado: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function formatRupiah(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function GiftTamuPage() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.guests);

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterGiftType, setFilterGiftType] = useState("all");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    dispatch(fetchGuests());
  }, [dispatch]);

  // Reset ke page 1 saat filter/search berubah
  const handleSearch = (v: string) => {
    setSearch(v);
    setCurrentPage(1);
  };
  const handleFilterKategori = (v: string) => {
    setFilterKategori(v);
    setCurrentPage(1);
  };
  const handleFilterGiftType = (v: string) => {
    setFilterGiftType(v);
    setCurrentPage(1);
  };

  // Filtered list - tampilkan semua tamu dengan filter search/kategori/giftType
  const filteredList = useMemo(() => {
    return list.filter((g) => {
      const matchSearch =
        search.trim() === "" ||
        g.nama.toLowerCase().includes(search.toLowerCase());

      const matchKategori =
        filterKategori === "all" || g.kategori === filterKategori;

      const matchGiftType =
        filterGiftType === "all" ||
        (filterGiftType === "none"
          ? !g.gift_type
          : g.gift_type === filterGiftType);

      return matchSearch && matchKategori && matchGiftType;
    });
  }, [list, search, filterKategori, filterGiftType]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const paginatedList = filteredList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Summary
  const totalUang = useMemo(() => {
    return list
      .filter((g) => g.gift_type === "uang" && g.gift_value)
      .reduce((sum, g) => sum + (parseFloat(g.gift_value ?? "0") || 0), 0);
  }, [list]);

  const totalKado = useMemo(
    () => list.filter((g) => g.gift_type === "kado").length,
    [list]
  );

  const totalGift = useMemo(
    () => list.filter((g) => g.gift_type != null && g.gift_type !== "").length,
    [list]
  );

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setModalOpen(true);
  };

  const handleSaveGift = async (
    id: string,
    gift_type: string | null,
    gift_value: string | null
  ) => {
    setSaving(true);
    try {
      await axiosClient.patch(`/gift-tamu/${id}`, { gift_type, gift_value });
      toast.success("Data gift berhasil disimpan!");
      setModalOpen(false);
      setEditingGuest(null);
      dispatch(fetchGuests());
    } catch {
      toast.error("Gagal menyimpan data gift!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gift Tamu
          </h1>
          <p className="text-muted-foreground">
            Daftar tamu undangan yang memberikan gift
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-4">
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Gift</p>
            <p className="text-2xl font-bold text-foreground">{totalGift}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <span className="text-lg">💵</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Uang</p>
            <p className="text-xl font-bold text-foreground">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(totalUang)}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
            <span className="text-lg">🎁</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Kado</p>
            <p className="text-2xl font-bold text-foreground">{totalKado}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card border border-border rounded-lg shadow-sm">
        {/* Search */}
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

        {/* Filter Kategori */}
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

        {/* Filter Tipe Gift */}
        <Select value={filterGiftType} onValueChange={handleFilterGiftType}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-input border-border">
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Tipe Gift" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="none">Belum Ada Gift</SelectItem>
            {GIFT_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
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
                  <TableHead className="text-foreground/80 font-semibold h-14 text-xs uppercase tracking-wider">
                    Tipe Gift
                  </TableHead>
                  <TableHead className="text-foreground/80 font-semibold h-14 text-xs uppercase tracking-wider">
                    Nominal / Nama Kado
                  </TableHead>
                  <TableHead className="text-foreground/80 font-semibold h-14 text-xs uppercase tracking-wider text-center">
                    Aksi
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
                        {guest.nama}
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
                      <TableCell className="py-4">
                        {guest.gift_type ? (
                          <Badge
                            className={cn(
                              "font-medium border px-3 py-1",
                              GIFT_TYPE_BADGE[guest.gift_type] ??
                                "bg-gray-500/15 text-gray-400 border-gray-500/30"
                            )}
                          >
                            {guest.gift_type === "uang" ? "💵 Uang" : "🎁 Kado"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-foreground">
                        {guest.gift_type === "uang" && guest.gift_value ? (
                          formatRupiah(guest.gift_value)
                        ) : guest.gift_value ? (
                          guest.gift_value
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(guest)}
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Gift className="h-10 w-10 opacity-30" />
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 px-4 border-border hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {editingGuest && (
        <GiftFormModal
          key={editingGuest.id}
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setEditingGuest(null);
          }}
          guest={editingGuest}
          onSubmit={handleSaveGift}
          loading={saving}
        />
      )}
    </div>
  );
}
