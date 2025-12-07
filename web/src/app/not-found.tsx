import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(236,72,153,0.22),transparent_45%),radial-gradient(circle_at_80%_-20%,rgba(79,70,229,0.25),transparent_55%)]" />
      
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-slate-900 to-black">
              404
            </h1>
          </div>

          {/* Error Message */}
          <h2 className="mb-4 text-3xl font-semibold text-white sm:text-4xl">
            Sayfa Bulunamadı
          </h2>
          <p className="mb-8 text-lg text-slate-200/70">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>

          {/* Actions */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-900 via-slate-900 to-black px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:opacity-90"
            >
              Ana Sayfaya Dön
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-white/60"
            >
              Giriş Yap
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="mb-4 text-sm font-semibold text-slate-200">Yardımcı Linkler:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/" className="text-amber-300 hover:text-amber-200 transition">
                Ana Sayfa
              </Link>
              <Link href="/#features" className="text-amber-300 hover:text-amber-200 transition">
                Özellikler
              </Link>
              <Link href="/#pricing" className="text-amber-300 hover:text-amber-200 transition">
                Paketler
              </Link>
              <Link href="/#faq" className="text-amber-300 hover:text-amber-200 transition">
                SSS
              </Link>
              <Link href="/#contact" className="text-amber-300 hover:text-amber-200 transition">
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

