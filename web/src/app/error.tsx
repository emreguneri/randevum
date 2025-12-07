"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(236,72,153,0.22),transparent_45%),radial-gradient(circle_at_80%_-20%,rgba(79,70,229,0.25),transparent_55%)]" />
      
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-amber-900/20 via-slate-900/20 to-black/20">
              <svg
                className="h-12 w-12 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="mb-4 text-3xl font-semibold text-white sm:text-4xl">
            Bir Hata Oluştu
          </h1>
          <p className="mb-2 text-lg text-slate-200/70">
            Üzgünüz, beklenmeyen bir hata oluştu.
          </p>
          {error.message && (
            <p className="mb-8 text-sm text-slate-400/70">
              Hata: {error.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-900 via-slate-900 to-black px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:opacity-90"
            >
              Tekrar Dene
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-white/60"
            >
              Ana Sayfaya Dön
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="mb-2 text-sm font-semibold text-slate-200">Sorun devam ederse:</p>
            <p className="text-sm text-slate-200/70">
              Lütfen{" "}
              <Link href="/#contact" className="text-amber-300 hover:text-amber-200 transition underline">
                destek ekibimizle
              </Link>{" "}
              iletişime geçin veya sayfayı yenileyip tekrar deneyin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

