"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Heart, Clock, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function PendingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = useCallback(async () => {
    setChecking(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

      if (!profile) {
        toast.error("Profil tidak ditemukan");
        return;
      }

      if (profile.status === "active") {
        toast.success("Akun kamu sudah disetujui! Mengarahkan ke dashboard...");
        router.push("/dashboard/tamu-undangan");
      } else if (profile.status === "rejected") {
        toast.error("Akun kamu ditolak oleh admin.");
        router.push("/rejected");
      } else {
        toast.info("Akun kamu masih menunggu persetujuan admin.");
      }
    } catch {
      toast.error("Gagal mengecek status. Coba lagi.");
    } finally {
      setChecking(false);
    }
  }, [router]);

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
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Menunggu Persetujuan
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Akun kamu sudah terdaftar dan sedang menunggu persetujuan dari
            admin. Kamu akan bisa mengakses dashboard setelah akun disetujui.
          </p>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            Status: Menunggu Persetujuan
          </span>
        </div>

        {/* Info box */}
        <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
          <p className="text-sm font-medium text-foreground">
            Apa yang terjadi selanjutnya?
          </p>
          <ul className="space-y-2">
            {[
              "Admin akan meninjau pendaftaran kamu",
              "Kamu akan bisa login setelah disetujui",
              "Hubungi admin jika butuh bantuan",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Cek Status */}
        <Button
          className="w-full h-11 gap-2 bg-primary hover:bg-primary/90 text-white font-medium shadow-md"
          onClick={handleCheckStatus}
          disabled={checking}
        >
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Mengecek status..." : "Cek Status Persetujuan"}
        </Button>

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
