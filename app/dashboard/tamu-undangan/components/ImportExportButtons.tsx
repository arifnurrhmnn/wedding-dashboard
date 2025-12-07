"use client";

import { useState, useRef } from "react";
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
  Upload,
  Download,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Papa from "papaparse";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";

interface ImportExportButtonsProps {
  onImportSuccess: () => void;
  guests: Array<{
    unique_id?: string;
    nama: string;
    kategori: string;
    skala_prioritas: string;
    tipe_undangan: string;
    qty: number;
  }>;
}

interface ImportSummary {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

export function ImportExportButtons({
  onImportSuccess,
  guests,
}: ImportExportButtonsProps) {
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [pendingData, setPendingData] = useState<
    Record<string, string | number>[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (guests.length === 0) {
      toast.error("Tidak ada data untuk di-export");
      return;
    }

    // Reverse the order: newest first (descending)
    const reversedGuests = [...guests].reverse();

    const csvData = reversedGuests.map((guest) => ({
      unique_id: guest.unique_id || "",
      nama: guest.nama,
      kategori: guest.kategori,
      skala_prioritas: guest.skala_prioritas,
      tipe_undangan: guest.tipe_undangan,
      qty: guest.qty,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tamu-undangan-${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Data berhasil di-export");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("File harus berformat CSV");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith(".csv")) {
        toast.error("File harus berformat CSV");
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImport = () => {
    if (!file) {
      toast.error("Pilih file CSV terlebih dahulu");
      return;
    }

    setImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error("Error parsing CSV file");
          setImporting(false);
          return;
        }

        if (results.data.length === 0) {
          toast.error("File CSV kosong");
          setImporting(false);
          return;
        }

        // Check if CSV has unique_id column
        const firstRow = results.data[0] as Record<string, string | number>;
        const hasId =
          firstRow.hasOwnProperty("unique_id") &&
          firstRow.unique_id !== undefined &&
          firstRow.unique_id !== "";

        setPendingData(results.data as Record<string, string | number>[]);

        if (!hasId) {
          // Show warning modal
          setImporting(false);
          setWarningModalOpen(true);
        } else {
          // Proceed with import - keep modal open with loading
          processImport(results.data as Record<string, string | number>[]);
        }
      },
      error: (error) => {
        toast.error(`Error: ${error.message}`);
        setImporting(false);
      },
    });
  };

  const processImport = async (data: Record<string, string | number>[]) => {
    setImporting(true);
    try {
      const response = await axiosClient.post("/tamu-undangan/import", {
        data,
      });

      setSummary(response.data.summary);
      setImportModalOpen(false);
      setFile(null);
      setSummaryModalOpen(true);
      onImportSuccess();

      toast.success("Import selesai");
    } catch (error) {
      toast.error("Gagal import data");
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const handleContinueWithoutUniqueId = () => {
    setWarningModalOpen(false);
    setImporting(true);
    processImport(pendingData);
  };

  const downloadTemplate = () => {
    const template = [
      {
        unique_id: "INV-000001",
        nama: "Contoh Nama",
        kategori: "Keluarga Inti",
        skala_prioritas: "Wajib Hadir",
        tipe_undangan: "Digital",
        qty: 1,
      },
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template-tamu-undangan.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Template berhasil di-download");
  };

  const downloadErrorLog = () => {
    if (!summary || summary.errors.length === 0) return;

    const csv = Papa.unparse(summary.errors);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `error-log-${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAll = async () => {
    if (guests.length === 0) {
      toast.error("Tidak ada data untuk dihapus");
      return;
    }

    try {
      setDeleting(true);
      const response = await axiosClient.delete("/tamu-undangan/delete-all");

      if (response.data.success) {
        toast.success(`Berhasil menghapus ${response.data.count} data tamu`);
        setDeleteAllModalOpen(false);
        onImportSuccess(); // Refresh the guest list
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting all guests:", error);
      toast.error("Terjadi kesalahan saat menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setImportModalOpen(true)}
          className="h-10 border-border hover:bg-secondary gap-2"
        >
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
        <Button
          variant="outline"
          onClick={handleExport}
          className="h-10 border-border hover:bg-secondary gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => setDeleteAllModalOpen(true)}
          className="h-10 border-destructive text-destructive hover:bg-destructive/10 gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete All
        </Button>
      </div>

      {/* Import Modal */}
      <Dialog
        open={importModalOpen}
        onOpenChange={(open) => {
          if (!importing) {
            setImportModalOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] border-border shadow-2xl bg-card">
          {importing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-4">
                <div className="inline-block h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">
                    Memproses Import...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mohon tunggu, sedang mengupload dan memvalidasi data
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Import Data Tamu Undangan
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload file CSV untuk menambahkan atau mengupdate data tamu
              undangan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                    className="ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-foreground font-medium">
                      Drag & drop file CSV atau klik untuk browse
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Maximum file size: 5MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Browse File
                  </Button>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-foreground text-sm">
                Format CSV:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  • <strong>unique_id</strong> (optional) - untuk update data
                  existing
                </li>
                <li>
                  • <strong>nama</strong> (required) - nama tamu
                </li>
                <li>
                  • <strong>kategori</strong> (optional)
                </li>
                <li>
                  • <strong>skala_prioritas</strong> (optional)
                </li>
                <li>
                  • <strong>tipe_undangan</strong> (optional)
                </li>
                <li>
                  • <strong>qty</strong> (optional) - default: 1
                </li>
              </ul>
              <Button
                variant="link"
                onClick={downloadTemplate}
                className="text-primary p-0 h-auto"
              >
                Download Template CSV
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setImportModalOpen(false);
                setFile(null);
              }}
              disabled={importing}
              className="flex-1 h-11 border-border hover:bg-secondary"
            >
              Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md"
            >
              {importing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                "Upload & Process"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Modal - No unique_id */}
      <Dialog open={warningModalOpen} onOpenChange={setWarningModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Peringatan: Tidak Ada unique_id
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              CSV tidak memiliki kolom <strong>unique_id</strong>. Semua row
              akan dianggap data baru dan bisa menyebabkan duplikasi jika file
              ini adalah hasil edit ulang dari CSV lama.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-yellow-500/10 rounded-lg p-4 space-y-2">
            <p className="text-sm text-foreground">
              <strong>Rekomendasi:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>
                • Export data existing terlebih dahulu untuk mendapatkan
                unique_id
              </li>
              <li>• Edit file export tersebut lalu upload kembali</li>
              <li>• Atau lanjutkan jika Anda yakin ini adalah data baru</li>
            </ul>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setWarningModalOpen(false);
                setPendingData([]);
              }}
              className="flex-1 h-11 border-border hover:bg-secondary"
            >
              Batal
            </Button>
            <Button
              onClick={handleContinueWithoutUniqueId}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Lanjutkan Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Modal */}
      <Dialog open={summaryModalOpen} onOpenChange={setSummaryModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Import Summary
              </DialogTitle>
            </div>
          </DialogHeader>

          {summary && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <p className="text-2xl font-bold text-foreground">
                    {summary.total}
                  </p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Inserted
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {summary.inserted}
                  </p>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Updated
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {summary.updated}
                  </p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Skipped
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {summary.skipped}
                  </p>
                </div>
              </div>

              {summary.errors.length > 0 && (
                <div className="bg-red-500/10 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                    {summary.errors.length} Error(s) Found
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadErrorLog}
                    className="text-red-600 border-red-600 hover:bg-red-500/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Error Log
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              onClick={() => {
                setSummaryModalOpen(false);
                setSummary(null);
              }}
              className="w-full h-11 bg-primary hover:bg-primary/90"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Modal */}
      <Dialog open={deleteAllModalOpen} onOpenChange={setDeleteAllModalOpen}>
        <DialogContent className="sm:max-w-[450px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Hapus Semua Data
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Anda akan menghapus{" "}
              <span className="font-bold text-destructive">
                {guests.length} data tamu
              </span>
              .
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteAllModalOpen(false)}
              className="flex-1 h-11 border-border hover:bg-secondary"
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteAll}
              disabled={deleting}
              className="flex-1 h-11 bg-destructive hover:bg-destructive/90 text-white font-medium shadow-md"
            >
              {deleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menghapus...
                </div>
              ) : (
                "Hapus Semua"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
