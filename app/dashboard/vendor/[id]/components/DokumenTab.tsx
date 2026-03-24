"use client";

import { FileText, Upload, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VendorDocument } from "@/redux/slices/vendorSlice";

interface DokumenTabProps {
  vendorId: string;
  documents: VendorDocument[];
}

const TIPE_ICONS: Record<string, string> = {
  Kontrak: "📄",
  Invoice: "🧾",
  "Penawaran Harga": "💰",
  "Foto Referensi": "📸",
  Lainnya: "📁",
};

export function DokumenTab({ documents }: DokumenTabProps) {
  // Document upload functionality requires Supabase Storage configuration.
  // Currently shows existing documents and upload placeholder.

  if (documents.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Dokumen</h3>
            <p className="text-sm text-muted-foreground">
              Simpan kontrak, invoice, dan dokumen penting lainnya
            </p>
          </div>
        </div>

        <div className="text-center py-14 border-2 border-dashed border-border rounded-xl">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm font-medium">
            Belum ada dokumen
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
            Fitur upload dokumen (kontrak, invoice, referensi foto) akan segera
            tersedia
          </p>
          <Button variant="outline" size="sm" className="mt-4" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Upload Dokumen (Coming Soon)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Dokumen</h3>
          <p className="text-sm text-muted-foreground">
            {documents.length} dokumen tersimpan
          </p>
        </div>
        <Button size="sm" disabled>
          <Upload className="h-4 w-4 mr-1.5" />
          Upload (Coming Soon)
        </Button>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 group"
          >
            <div className="text-2xl shrink-0">
              {TIPE_ICONS[doc.tipe] ?? "📁"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {doc.nama}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doc.tipe} · {doc.file_name}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
