"use client";

import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface ShopCard {
  slug: string;
  name: string;
  address?: string;
  description?: string;
}

export function ShopsShowcase() {
  const [shops, setShops] = useState<ShopCard[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "shops"), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const items: ShopCard[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          slug: data.slug || docSnap.id,
          name: data.name || "İsimsiz İşletme",
          address: data.address,
          description: data.description,
        };
      });
      setShops(items);
    };
    load();
  }, []);

  const filteredShops = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    if (!queryText) return shops;
    return shops.filter((shop) => {
      const haystack = `${shop.name} ${shop.address ?? ""} ${shop.description ?? ""}`.toLowerCase();
      return haystack.includes(queryText);
    });
  }, [search, shops]);

  if (shops.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-8" id="book">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-10 text-center text-slate-200/70 shadow-xl shadow-black/20 backdrop-blur">
          Henüz vitrine eklenen bir işletme yok. İlk işletme siz olun!
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-8" id="book">
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-10 shadow-xl shadow-black/20 backdrop-blur">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-fuchsia-200/90">
            İşletme vitrinimiz
          </span>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">İşletmelerimizi Keşfedin</h2>
            <p className="mx-auto max-w-2xl text-base text-slate-200/75">
            Randevum ağına katılan işletmeler aşağıda listelenir. Aradığınız işletmeyi filtreleyip saniyeler içinde randevu talebi bırakabilirsiniz.
          </p>
          <div className="grid w-full gap-4 text-left sm:grid-cols-3">
            {[
              { title: "Anında Talep", description: "Boş saatleri görüntüleyip saniyeler içinde rezervasyon isteği gönderin." },
              { title: "Güvenilir İşletmeler", description: "Abonelikli işletmeler takvimlerini düzenli olarak güncelliyor." },
              { title: "Kolay İletişim", description: "İşletmenin açıklama ve adresine hızla ulaşın." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-200/80">
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-300/70">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="relative w-full max-w-md">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="İşletme adı, adres veya açıklama ara..."
              className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-2 py-1 text-[10px] uppercase tracking-widest text-white/80 transition hover:bg-white/30"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {filteredShops.map((shop) => (
            <div
              key={shop.slug}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-6 transition hover:border-fuchsia-400/50 hover:bg-slate-900/80"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-indigo-500/10 opacity-0 transition group-hover:opacity-100" />
              <div className="relative flex h-full flex-col gap-4 text-left">
                <div>
                  <h3 className="text-xl font-semibold text-white">{shop.name}</h3>
                  {shop.address && <p className="mt-1 text-xs uppercase tracking-wide text-slate-300/60">{shop.address}</p>}
                </div>
                {shop.description && (
                  <p className="flex-1 text-sm leading-6 text-slate-200/70">{shop.description}</p>
                )}
                <Link
                  href={`/book/${shop.slug}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-fuchsia-400/80 hover:text-fuchsia-100"
                >
                  Randevu Talep Et
                </Link>
              </div>
            </div>
          ))}
          {filteredShops.length === 0 && (
            <p className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-200/70">
              Aradığınız kriterlere uygun bir işletme bulunamadı. Filtreyi temizleyip tekrar deneyin.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
