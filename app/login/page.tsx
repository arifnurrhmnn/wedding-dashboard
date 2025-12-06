"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LOGIN_CREDENTIALS } from "@/utils/constants";
import { Leaf, Heart } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      router.push("/dashboard/tamu-undangan");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (
        username === LOGIN_CREDENTIALS.username &&
        password === LOGIN_CREDENTIALS.password
      ) {
        localStorage.setItem("isLoggedIn", "true");
        toast.success("Login berhasil!");
        router.push("/dashboard/tamu-undangan");
      } else {
        toast.error("Username atau password salah!");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.05),transparent_50%)]"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="max-w-md space-y-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-3xl shadow-2xl shadow-primary/30">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                Wedding Dashboard
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Kelola daftar tamu undangan pernikahan Anda dengan mudah dan
                terorganisir
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-8">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-75"></div>
              <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center space-y-4 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/30">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Wedding Dashboard
            </h2>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Welcome Back
            </h2>
            <p className="text-muted-foreground">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-card border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-card border-border focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Memuat...
                </div>
              ) : (
                "Masuk"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Username:{" "}
                <span className="font-medium text-foreground">admin</span>
              </p>
              <p>
                Password:{" "}
                <span className="font-medium text-foreground">admin123</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
