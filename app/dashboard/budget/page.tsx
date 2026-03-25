"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchBudgetSettings,
  fetchBudgetCategories,
  fetchBudgetItems,
  upsertBudgetSettings,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  generateDefaultCategories,
  addBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  BudgetCategory,
  BudgetItem,
} from "@/redux/slices/budgetSlice";
import { fetchVendors } from "@/redux/slices/vendorSlice";
import { fetchSeserahan } from "@/redux/slices/seserahanSlice";
import { fetchSouvenir } from "@/redux/slices/souvenirSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Plus,
  Sparkles,
  ChevronDown,
  ListFilter,
} from "lucide-react";
import { BudgetHero } from "./components/BudgetHero";
import { BudgetCategoryCard } from "./components/BudgetCategoryCard";
import { SetBudgetModal } from "./components/SetBudgetModal";
import { CategoryFormModal } from "./components/CategoryFormModal";
import { BudgetFormModal } from "./components/BudgetFormModal";

export default function BudgetPage() {
  const dispatch = useAppDispatch();
  const { settings, categories, items, loading } = useAppSelector(
    (s) => s.budget
  );
  const { list: vendors } = useAppSelector((s) => s.vendor);
  const { list: seserahanList } = useAppSelector((s) => s.seserahan);
  const { list: souvenirList } = useAppSelector((s) => s.souvenir);

  // modals
  const [setBudgetOpen, setSetBudgetOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
    null
  );
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] =
    useState<BudgetCategory | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>("");
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // filter
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterCategory, setFilterCategory] = useState("semua");

  const [savingBudget, setSavingBudget] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deletingCategoryLoading, setDeletingCategoryLoading] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [generatingDefault, setGeneratingDefault] = useState(false);
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);

  useEffect(() => {
    const initCategories = async () => {
      const result = await dispatch(fetchBudgetCategories());
      if (fetchBudgetCategories.fulfilled.match(result)) {
        const cats =
          result.payload as import("@/redux/slices/budgetSlice").BudgetCategory[];
        const hasSeserahan = cats.some((c) =>
          c.nama.toLowerCase().includes("seserahan")
        );
        const hasSouvenir = cats.some((c) =>
          c.nama.toLowerCase().includes("souvenir")
        );
        if (!hasSeserahan)
          dispatch(addBudgetCategory({ nama: "Seserahan", icon: "🎁" }));
        if (!hasSouvenir)
          dispatch(addBudgetCategory({ nama: "Souvenir", icon: "🎀" }));
      }
    };

    dispatch(fetchBudgetSettings());
    initCategories();
    dispatch(fetchBudgetItems());
    dispatch(fetchVendors());
    dispatch(fetchSeserahan());
    dispatch(fetchSouvenir());
  }, [dispatch]);

  // ── Handlers: Settings ──────────────────────────────────────────
  const handleSaveBudget = async (total_budget: number, catatan: string) => {
    setSavingBudget(true);
    try {
      await dispatch(upsertBudgetSettings({ total_budget, catatan })).unwrap();
      toast.success("Budget berhasil disimpan!");
      setSetBudgetOpen(false);
    } catch {
      toast.error("Gagal menyimpan budget");
    } finally {
      setSavingBudget(false);
    }
  };

  // ── Handlers: Category ──────────────────────────────────────────
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: BudgetCategory) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: { nama: string; icon: string }) => {
    setSavingCategory(true);
    try {
      if (editingCategory) {
        await dispatch(
          updateBudgetCategory({ id: editingCategory.id, data })
        ).unwrap();
        toast.success("Kategori berhasil diupdate!");
      } else {
        await dispatch(addBudgetCategory(data)).unwrap();
        toast.success("Kategori berhasil ditambahkan!");
      }
      setCategoryModalOpen(false);
    } catch {
      toast.error("Gagal menyimpan kategori");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategoryConfirm = (cat: BudgetCategory) => {
    setDeletingCategory(cat);
    setDeleteCategoryOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeletingCategoryLoading(true);
    try {
      await dispatch(deleteBudgetCategory(deletingCategory.id)).unwrap();
      toast.success("Kategori berhasil dihapus!");
      setDeleteCategoryOpen(false);
      setDeletingCategory(null);
    } catch (err: unknown) {
      const msg =
        typeof err === "string"
          ? err
          : (err as { message?: string })?.message ??
            "Gagal menghapus kategori";
      toast.error(
        msg.includes("masih memiliki item")
          ? "Hapus semua item dulu sebelum menghapus kategori"
          : msg
      );
    } finally {
      setDeletingCategoryLoading(false);
    }
  };

  const handleGenerateDefault = async () => {
    setGeneratingDefault(true);
    try {
      await dispatch(generateDefaultCategories()).unwrap();
      toast.success("Kategori default berhasil dibuat!");
      setGenerateConfirmOpen(false);
    } catch {
      toast.error("Gagal membuat kategori default");
    } finally {
      setGeneratingDefault(false);
    }
  };

  // ── Handlers: Item ──────────────────────────────────────────────
  const handleOpenAddItem = (categoryId: string) => {
    setEditingItem(null);
    setDefaultCategoryId(categoryId);
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = async (
    data: Omit<BudgetItem, "id" | "created_at" | "updated_at" | "vendor_nama">
  ) => {
    setSavingItem(true);
    try {
      if (editingItem) {
        await dispatch(updateBudgetItem({ id: editingItem.id, data })).unwrap();
        toast.success("Item berhasil diupdate!");
      } else {
        await dispatch(addBudgetItem(data)).unwrap();
        toast.success("Item berhasil ditambahkan!");
      }
      setItemModalOpen(false);
    } catch {
      toast.error("Gagal menyimpan item");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (item: BudgetItem) => {
    setDeletingItemId(item.id);
    try {
      await dispatch(deleteBudgetItem(item.id)).unwrap();
      toast.success("Item berhasil dihapus!");
    } catch {
      toast.error("Gagal menghapus item");
    } finally {
      setDeletingItemId(null);
    }
  };

  // ── Filtered & sorted categories ────────────────────────────────
  const filteredCategories = categories
    .filter((cat) => filterCategory === "semua" || cat.id === filterCategory)
    .sort((a, b) => a.urutan - b.urutan);

  const getItemsForCategory = (categoryId: string) =>
    items.filter(
      (i) =>
        i.category_id === categoryId &&
        (filterStatus === "semua" || i.status === filterStatus)
    );

  // Summary counts for filter chips
  const countByStatus = (s: string) =>
    items.filter((i) => i.status === s).length;

  // ── Linked summary dari Seserahan & Souvenir ────────────────────
  const seserahanSummary = {
    label: "Seserahan",
    href: "/dashboard/seserahan",
    totalEstimasi: seserahanList.reduce((s, i) => s + (i.harga || 0), 0),
    totalRealisasi: seserahanList
      .filter((i) => i.status_pembelian === "Sudah Dibeli")
      .reduce((s, i) => s + (i.harga || 0), 0),
    count: seserahanList.length,
    countLabel: "item",
    items: seserahanList.map((i) => ({
      id: i.id,
      nama: i.nama_item,
      harga: i.harga || 0,
      sudahDibeli: i.status_pembelian === "Sudah Dibeli",
    })),
  };

  const souvenirSummary = {
    label: "Souvenir",
    href: "/dashboard/souvenir",
    totalEstimasi: souvenirList.reduce(
      (s, i) => s + (i.total_harga ?? i.harga_per_item * i.jumlah ?? 0),
      0
    ),
    totalRealisasi: souvenirList
      .filter((i) => i.status_pengadaan === "Sudah Dibeli")
      .reduce(
        (s, i) => s + (i.total_harga ?? i.harga_per_item * i.jumlah ?? 0),
        0
      ),
    count: souvenirList.length,
    countLabel: "jenis",
    items: souvenirList.map((i) => ({
      id: i.id,
      nama: i.nama_souvenir,
      harga: i.total_harga ?? i.harga_per_item * i.jumlah ?? 0,
      sudahDibeli: i.status_pengadaan === "Sudah Dibeli",
    })),
  };

  const getLinkedSummary = (catNama: string) => {
    const lower = catNama.toLowerCase();
    if (lower.includes("seserahan")) return seserahanSummary;
    if (lower.includes("souvenir")) return souvenirSummary;
    return undefined;
  };

  // Kategori yang bukan linked (bukan Seserahan/Souvenir)
  const nonLinkedCategories = categories.filter(
    (cat) => !getLinkedSummary(cat.nama)
  );

  // Auto-estimasi: untuk kategori yg punya linked module tapi belum ada budget items,
  // total dari seserahan/souvenir otomatis dihitung sebagai estimasi.
  const autoLinkedEstimasi = categories.reduce((sum, cat) => {
    const linked = getLinkedSummary(cat.nama);
    if (!linked || linked.totalEstimasi === 0) return sum;
    const hasItems = items.some((i) => i.category_id === cat.id);
    if (!hasItems) return sum + linked.totalEstimasi;
    return sum;
  }, 0);

  // Auto-realisasi: total "sudah dibeli" dari seserahan/souvenir juga masuk ke "Sudah Dibayar"
  const autoLinkedRealisasi = categories.reduce((sum, cat) => {
    const linked = getLinkedSummary(cat.nama);
    if (!linked || linked.totalRealisasi === 0) return sum;
    const hasItems = items.some((i) => i.category_id === cat.id);
    if (!hasItems) return sum + linked.totalRealisasi;
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Budget & Keuangan
          </h1>
          <p className="text-muted-foreground">
            Rencanakan dan pantau semua pengeluaran pernikahan Anda
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {nonLinkedCategories.length === 0 && (
            <Button
              variant="outline"
              onClick={() => setGenerateConfirmOpen(true)}
              className="btn-shimmer h-10 gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="h-4 w-4" />
              Generate Kategori Default
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleOpenAddCategory}
            className="h-10 gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </Button>
          <Button
            onClick={() => {
              setEditingItem(null);
              setDefaultCategoryId("");
              setItemModalOpen(true);
            }}
            className="h-10 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Item
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="inline-block h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Memuat data budget...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Hero summary */}
          <BudgetHero
            settings={settings}
            categories={categories}
            items={items}
            autoLinkedEstimasi={autoLinkedEstimasi}
            autoLinkedRealisasi={autoLinkedRealisasi}
            onSetBudget={() => setSetBudgetOpen(true)}
          />

          {/* Filters */}
          {(categories.length > 0 || items.length > 0) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Status filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <ListFilter className="h-4 w-4 text-muted-foreground shrink-0" />
                {[
                  { value: "semua", label: "Semua" },
                  {
                    value: "belum_bayar",
                    label: `Belum Bayar (${countByStatus("belum_bayar")})`,
                  },
                  { value: "dp", label: `DP (${countByStatus("dp")})` },
                  {
                    value: "lunas",
                    label: `Lunas (${countByStatus("lunas")})`,
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterStatus(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      filterStatus === opt.value
                        ? "bg-primary text-white border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Category filter dropdown */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-56 h-9 bg-input border-border text-sm">
                  <SelectValue placeholder="Semua Kategori" />
                  <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Empty state: truly no categories */}
          {categories.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <p className="text-4xl mb-4">💰</p>
              <p className="text-lg font-semibold text-foreground mb-2">
                Belum ada kategori budget
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Mulai dengan generate kategori default atau buat kategori
                sendiri
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Button
                  onClick={handleGenerateDefault}
                  disabled={generatingDefault}
                  className="btn-shimmer bg-primary hover:bg-primary/90 text-white gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Kategori Default
                </Button>
                <Button variant="outline" onClick={handleOpenAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Kategori Manual
                </Button>
              </div>
            </div>
          )}

          {/* Hint state: hanya ada Seserahan/Souvenir, belum ada kategori lain */}
          {categories.length > 0 && nonLinkedCategories.length === 0 && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-primary/20 bg-primary/5 text-sm">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  Belum ada kategori budget lainnya
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Seserahan dan Souvenir sudah tersinkron otomatis. Tambah
                  kategori lain seperti Venue, Katering, dan Foto untuk
                  melengkapi budget pernikahan Anda.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setGenerateConfirmOpen(true)}
                className="btn-shimmer shrink-0 h-8 bg-primary hover:bg-primary/90 text-white gap-1.5 text-xs"
              >
                <Sparkles className="h-3 w-3" />
                Generate Default
              </Button>
            </div>
          )}

          {/* Category cards */}
          {filteredCategories.length > 0 && (
            <div className="space-y-3">
              {filteredCategories.map((cat) => (
                <BudgetCategoryCard
                  key={cat.id}
                  category={cat}
                  items={getItemsForCategory(cat.id)}
                  onAddItem={handleOpenAddItem}
                  onEditItem={handleOpenEditItem}
                  onDeleteItem={handleDeleteItem}
                  onEditCategory={handleOpenEditCategory}
                  onDeleteCategory={handleDeleteCategoryConfirm}
                  deletingItemId={deletingItemId}
                  linkedSummary={getLinkedSummary(cat.nama)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <SetBudgetModal
        open={setBudgetOpen}
        onOpenChange={setSetBudgetOpen}
        currentBudget={settings?.total_budget ?? 0}
        currentCatatan={settings?.catatan}
        onSubmit={handleSaveBudget}
        loading={savingBudget}
      />

      <CategoryFormModal
        open={categoryModalOpen}
        onOpenChange={setCategoryModalOpen}
        category={editingCategory}
        onSubmit={handleSaveCategory}
        loading={savingCategory}
      />

      <BudgetFormModal
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        item={editingItem}
        defaultCategoryId={defaultCategoryId}
        categories={categories}
        vendors={vendors}
        onSubmit={handleSaveItem}
        loading={savingItem}
      />

      {/* Delete Category Confirm */}
      <Dialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <DialogContent className="sm:max-w-[450px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Konfirmasi Hapus Kategori
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus kategori{" "}
              <span className="font-bold text-destructive">
                {deletingCategory?.nama}
              </span>
              ? Kategori hanya bisa dihapus jika tidak memiliki item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteCategoryOpen(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
              disabled={deletingCategoryLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={deletingCategoryLoading}
              className="flex-1 h-11 bg-destructive hover:bg-destructive/90 text-white font-medium shadow-md"
            >
              {deletingCategoryLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghapus...
                </div>
              ) : (
                "Hapus Kategori"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Default Categories Confirm */}
      <Dialog open={generateConfirmOpen} onOpenChange={setGenerateConfirmOpen}>
        <DialogContent className="sm:max-w-[520px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-3 pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Generate Kategori Default
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Sistem akan otomatis membuat{" "}
              <span className="font-semibold text-foreground">
                11 kategori budget
              </span>{" "}
              yang umum digunakan untuk pernikahan. Anda tetap bisa menambah,
              mengedit, atau menghapus kategori setelahnya.
            </DialogDescription>
          </DialogHeader>

          {/* List of categories to be generated */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 my-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Kategori yang akan dibuat:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { icon: "🏛️", nama: "Venue & Gedung" },
                { icon: "🍽️", nama: "Katering & Konsumsi" },
                { icon: "📸", nama: "Foto & Video" },
                { icon: "💐", nama: "Dekorasi & Florist" },
                { icon: "👗", nama: "Busana & Makeup" },
                { icon: "🎵", nama: "Entertainment & Musik" },
                { icon: "💌", nama: "Undangan" },
                { icon: "📄", nama: "Administrasi & Dokumen" },
                { icon: "🚗", nama: "Transportasi" },
                { icon: "👔", nama: "Pakaian Keluarga Inti" },
                { icon: "🔆", nama: "Lain-lain" },
              ].map((c) => (
                <div
                  key={c.nama}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <span>{c.icon}</span>
                  <span>{c.nama}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-primary/80 mt-3 pt-3 border-t border-border">
              🎀 <span className="font-semibold">Souvenir</span> dan 🎁{" "}
              <span className="font-semibold">Seserahan</span> tidak termasuk di
              sini — keduanya sudah otomatis dibuat dan tersinkron dengan modul
              masing-masing.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setGenerateConfirmOpen(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
              disabled={generatingDefault}
            >
              Batal
            </Button>
            <Button
              onClick={handleGenerateDefault}
              disabled={generatingDefault}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md gap-2"
            >
              {generatingDefault ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat Kategori...
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Ya, Generate Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
