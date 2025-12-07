"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const redirectTarget = searchParams.get("redirect");
    router.replace(redirectTarget || "/");
  }, [loading, user, router, searchParams]);
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await login(email, password);
      const redirectTarget = searchParams.get("redirect");
      router.replace(redirectTarget || "/");
    } catch (err: any) {
      setError(err?.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16 text-slate-50">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-white/[0.06] p-10 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold">Randevum'a Giriş Yap</h1>
          <p className="text-sm text-slate-200/70">
            E-posta adresiniz ve şifrenizle giriş yapın. Henüz hesabınız yoksa kayıt olun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="••••••••"
            />
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
            {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-200/70">
          Henüz hesabınız yok mu?{" "}
          <Link href="/auth/register" className="text-amber-300 underline">
            Hemen kayıt olun
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
        <div className="text-center">
          <p className="text-lg">Yükleniyor...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
