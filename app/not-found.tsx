import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-4">
      <p className="text-7xl font-black text-primary">404</p>
      <h1 className="text-xl font-semibold text-foreground">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-muted-foreground">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
      >
        <Home className="h-4 w-4" />
        Ke Dashboard
      </Link>
    </div>
  );
}
