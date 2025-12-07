"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function RegisterPage() {
  const { register, loading, user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "customer">("customer");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.role) {
      router.replace(user.role === "admin" ? "/dashboard/bookings" : "/customer/bookings");
    }
  }, [loading, user, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await register({ email, password, displayName, role });
    } catch (err: any) {
      setError(err?.message || "Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-white/[0.06] p-10 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Randevum’a Kayıt Ol</h1>
          <p className="text-sm text-slate-200/70">
            İşletme sahibi veya müşteri olarak kaydolun ve kontrol panelinize erişin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-slate-200/80" htmlFor="name">
              Ad Soyad
            </label>
            <input
              id="name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
              placeholder="Adınızı ve soyadınızı giriniz"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200/80" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
              placeholder="ornek@randevum.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-200/80" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
              placeholder="En az 6 karakter"
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm text-slate-200/80">Rol Seçimi</span>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`rounded-xl border px-4 py-3 transition ${
                  role === "customer"
                    ? "border-fuchsia-400 bg-fuchsia-500/20 text-white"
                    : "border-white/15 bg-white/5 text-slate-200/70 hover:border-white/40"
                }`}
              >
                Müşteri
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`rounded-xl border px-4 py-3 transition ${
                  role === "admin"
                    ? "border-emerald-400 bg-emerald-500/20 text-white"
                    : "border-white/15 bg-white/5 text-slate-200/70 hover:border-white/40"
                }`}
              >
                İşletme Sahibi
              </button>
            </div>
            <p className="text-xs text-slate-200/60">
              İşletme sahibi hesapları abonelik gerektirir; kayıt sonrası panelden ödeme yapabilirsiniz.
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-amber-800/30 bg-amber-900/20 px-4 py-2 text-sm text-amber-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-gradient-to-r from-amber-900 via-slate-900 to-black px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Kayıt olunuyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-200/70">
          Zaten hesabınız var mı?{" "}
          <Link href="/auth/login" className="text-amber-300 underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
