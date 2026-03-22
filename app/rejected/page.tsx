"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Heart, XCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function RejectedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    toast.success("Logout berhasil");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-destructive rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Pendaftaran Ditolak
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Maaf, pendaftaran akun kamu tidak disetujui oleh admin. Silakan
            hubungi admin untuk informasi lebih lanjut.
          </p>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-sm font-medium text-destructive">
            Status: Ditolak
          </span>
        </div>

        {/* Info box */}
        <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
          <p className="text-sm font-medium text-foreground">
            Yang bisa kamu lakukan:
          </p>
          <ul className="space-y-2">
            {[
              "Hubungi admin untuk mengetahui alasan penolakan",
              "Coba daftar ulang dengan akun yang berbeda",
              "Pastikan data yang kamu isi sudah benar",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-destructive">
                    {i + 1}
                  </span>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-11 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
