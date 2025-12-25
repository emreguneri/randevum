"use client";

import { BookingForm } from "@/components/booking-form";
import { ContactForm } from "@/components/contact-form";
import { ShopsShowcase } from "@/components/shops-showcase";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

function StatsSection() {
  const [stats, setStats] = useState({
    activeShops: "0",
    customerSatisfaction: "0.0",
    cities: "81",
    cloudBackup: "7/24",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Aktif işletme sayısı
        const shopsSnapshot = await getDocs(collection(db, "shops"));
        const activeShopsCount = shopsSnapshot.size;
        const activeShopsFormatted = activeShopsCount >= 1000 
          ? `${(activeShopsCount / 1000).toFixed(1)}K+`
          : activeShopsCount.toString();

        // Müşteri memnuniyeti (ortalama puan)
        const reviewsSnapshot = await getDocs(collection(db, "reviews"));
        let averageRating = 0;
        if (reviewsSnapshot.size > 0) {
          const ratings = reviewsSnapshot.docs
            .map((doc) => {
              const data = doc.data();
              return data.rating || 0;
            })
            .filter((rating) => rating > 0);
          
          if (ratings.length > 0) {
            const sum = ratings.reduce((acc, rating) => acc + rating, 0);
            averageRating = sum / ratings.length;
          }
        }
        const customerSatisfactionFormatted = averageRating > 0 
          ? `${averageRating.toFixed(1)} / 5`
          : "0.0 / 5";

        setStats({
          activeShops: activeShopsFormatted,
          customerSatisfaction: customerSatisfactionFormatted,
          cities: "81", // Sabit değer
          cloudBackup: "7/24", // Sabit değer
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statsItems = [
    { value: stats.activeShops, label: "Aktif işletme" },
    { value: stats.customerSatisfaction, label: "Müşteri memnuniyeti" },
    { value: stats.cities, label: "İlde kullanım" },
    { value: stats.cloudBackup, label: "Bulut yedekleme" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {statsItems.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/10 px-4 py-5 text-center shadow-sm shadow-black/10"
          style={{ backgroundColor: "#1a0a0a" }}
        >
          <p className="text-2xl font-semibold text-white">
            {loading ? "..." : item.value}
          </p>
          <p className="mt-2 text-xs text-slate-200/70">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

const coreFeatures = [
  {
    title: "Randevu Yönetimi",
    description:
      "Günlük yoğunluğu tek ekrandan takip edin, iptal ve değişiklikleri personelinize otomatik bildirin.",
    bullets: ["Personel takvimi", "Bekleme listesi", "Otomatik hatırlatma"],
  },
  {
    title: "İşletme Paneli",
    description:
      "Şube, hizmet ve personel yönetimini detaylı raporlarla kontrol edin; performansı anlık ölçün.",
    bullets: ["Hizmet kataloğu", "Gelir raporları", "Çok şubeli yapı"],
  },
  {
    title: "Müşteri Deneyimi",
    description:
      "Müşterileriniz mobil uygulama veya web üzerinden saniyeler içinde randevu oluşturabilsin.",
    bullets: ["Mobil uygulama uyumu", "Sadakat puanı", "Sınırsız müşteri kaydı"],
  },
];

const plans = [
  {
    name: "Başlangıç",
    price: "₺800",
    description: "1 personelli işletmeler için temel randevu yönetimi.",
    cta: "7 Gün Ücretsiz Dene",
    features: [
      "Tek şube ve tek personel",
      "Takvim ve randevu hatırlatma",
      "Sınırsız müşteri kaydı",
    ],
  },
  {
    name: "Profesyonel",
    price: "₺800",
    description: "Büyüyen işletmelere özel gelişmiş operasyon yönetimi.",
    cta: "7 Gün Ücretsiz Dene",
    highlighted: true,
    features: [
      "Sınırsız personel ve hizmet",
      "Gelir gider raporlaması",
      "Öncelikli destek",
      "iyzico ile abonelik tahsilatı",
    ],
  },
  {
    name: "Kurumsal",
    price: "Teklif Alın",
    description: "Birden fazla şube, franchise ve zincir markalar için özelleştirilebilir.",
    cta: "Satış Ekibiyle Görüş",
    features: [
      "Çok şubeli kontrol paneli",
      "Özel entegrasyonlar",
      "Eğitim ve onboarding paketi",
      "SLA'lı destek",
    ],
  },
];

const references = [
  "Glow Beauty Studio",
  "Refika Spa",
  "Linemed Aesthetic",
  "Nova Kuaför",
  "Fresh Barber",
  "Golden Touch",
];

const faqs = [
  {
    question: "Randevum'u herhangi bir cihazdan kullanabilir miyim?",
    answer:
      "Evet. Randevum web paneli, iOS ve Android uygulamaları ile bilgisayar, tablet ve mobil cihazlardan eşzamanlı çalışır.",
  },
  {
    question: "Verilerim güvende mi?",
    answer:
      "Tüm veriler Türkiye lokasyonlu bulut altyapısında şifrelenmiş olarak saklanır ve günlük yedeklenir.",
  },
  {
    question: "Personellerim ayrı hesap açmak zorunda mı?",
    answer:
      "Hayır. İşletme panelinizden personel ekleyebilir, sadece ihtiyaç duydukları modüllere erişim verebilirsiniz.",
  },
  {
    question: "Aboneliğimi nasıl iptal ederim?",
    answer:
      "Profilim sekmesindeki abonelik yönetimi ekranından tek tıkla iptal edebilir, dönem sonunda ücretlendirme durur.",
  },
];

export default function Home() {
  // Chart heights - client-side only to avoid hydration mismatch
  const [chartHeights, setChartHeights] = useState<number[]>([]);

  useEffect(() => {
    // Generate random heights only on client-side
    setChartHeights(Array.from({ length: 7 }, () => 30 + Math.random() * 50));
  }, []);
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-50" style={{ backgroundColor: '#0a0505' }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(101,20,20,0.15),transparent_45%),radial-gradient(circle_at_80%_-20%,rgba(50,10,10,0.12),transparent_55%)]" />

      <header className="relative z-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-8 lg:px-8">

          <div className="max-w-4xl">
            <div className="space-y-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90" style={{ backgroundColor: '#1a0a0a' }}>
                Randevu sistemi ile çalışan işletmeler için
              </span>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Randevum ile işletmenizi tek panelden yönetin, müşterileriniz hep yanınızda olsun.
          </h1>
              <p className="max-w-xl text-lg text-slate-200/80">
                Randevu planlama, personel yönetimi, raporlama ve pazarlama araçlarını tek platformda
                birleştirdik. Şubeniz ve ekibiniz büyüdükçe Randevum yanınızda.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90" style={{ background: 'linear-gradient(to right, #2d0a0a, #1a0a0a, #0a0505)', boxShadow: '0 10px 15px -3px rgba(45, 10, 10, 0.3)' }}
                >
                  7 Gün Ücretsiz Deneyin
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-white/60"
                >
                  Özellikleri keşfet
                </Link>
              </div>
              <StatsSection />
            </div>
          </div>
        </div>
      </header>

      {/* Demo / Ürün Görünümü Bölümü */}
      <section className="relative z-10 border-t border-white/10" style={{ backgroundColor: '#0f0808' }}>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
            {/* Sol Taraf - Açıklama ve Adımlar */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                  Nasıl çalışır?
                </h2>
                <p className="text-lg leading-relaxed text-slate-200/80 sm:text-xl">
                  Mekanını ekle, hizmetlerini tanımla, linkini paylaş. Randevular otomatik gelsin.
                </p>
              </div>

              {/* Adım Adım Süreç */}
              <div className="space-y-6 rounded-2xl border border-white/10 p-6 backdrop-blur" style={{ backgroundColor: '#1a0a0a' }}>
                {[
                  {
                    step: "1",
                    title: "Hesap Oluştur",
                    description: "Ücretsiz kayıt ol, 7 gün deneme süresini başlat.",
                    icon: "✨",
                  },
                  {
                    step: "2",
                    title: "İşletmeni Ekle",
                    description: "Konum, çalışma saatleri ve iletişim bilgilerini gir.",
                    icon: "📍",
                  },
                  {
                    step: "3",
                    title: "Hizmetlerini Tanımla",
                    description: "Hizmet adı, süre, fiyat ve personel bilgilerini ekle.",
                    icon: "⚙️",
                  },
                  {
                    step: "4",
                    title: "Linkini Paylaş",
                    description: "WhatsApp, Instagram veya web sitende özel linkini paylaş.",
                    icon: "🔗",
                  },
                  {
                    step: "5",
                    title: "Randevular Otomatik Gelsin",
                    description: "Müşterilerin randevu alması, senin sadece onaylaman yeterli.",
                    icon: "📅",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Step Number */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold text-white/90" style={{ borderColor: 'rgba(109, 20, 20, 0.3)', background: 'linear-gradient(to bottom right, rgba(45, 10, 10, 0.3), rgba(26, 10, 10, 0.3))' }}>
                      {item.step}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <h3 className="font-semibold text-white">{item.title}</h3>
                      </div>
                      <p className="text-sm text-slate-300/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Butonu */}
              <div className="pt-4">
                <Link
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40" style={{ backgroundColor: '#1a0a0a' }}
                >
                  <span>Hemen Başla</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Sağ Taraf - Ürün Gösterimi */}
            <div className="space-y-6">
              {/* Demo Video Placeholder - Daha Gerçekçi */}
              <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ background: 'linear-gradient(to bottom right, rgba(26, 10, 10, 0.9), rgba(10, 5, 5, 1))' }}>
                {/* Video Poster Background - Mockup Dashboard Görünümü */}
                <div className="absolute inset-0 p-6" style={{ background: 'linear-gradient(to bottom right, rgba(45, 10, 10, 0.1), rgba(26, 10, 10, 0.5), rgba(10, 5, 5, 0.8))' }}>
                  {/* Dashboard Mockup */}
                  <div className="h-full space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg" style={{ background: 'linear-gradient(to bottom right, #2d0a0a, #1a0a0a)' }} />
                        <div className="space-y-1">
                          <div className="h-2 w-24 rounded bg-white/20" />
                          <div className="h-1.5 w-16 rounded bg-white/10" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-6 rounded-full bg-white/10" />
                        <div className="h-6 w-6 rounded-full bg-white/10" />
                      </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2 rounded-lg border border-white/10 p-2" style={{ backgroundColor: '#1a0a0a' }}>
                          <div className="h-1.5 w-12 rounded bg-white/10" />
                          <div className="h-3 w-16 rounded bg-white/20" />
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar View */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded border ${
                            i === 6 || i === 10
                              ? "border-white/20"
                              : "border-white/5"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all group-hover:bg-black/30">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 backdrop-blur-md transition-all group-hover:scale-110 group-hover:border-white/50 group-hover:bg-[#2d0a0a]" style={{ backgroundColor: '#1a0a0a' }}>
                    <svg
                      className="ml-1 h-12 w-12 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Video Info Labels */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    🎬 Demo Video - 2:34
                  </div>
                  <div className="rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    HD • 1080p
                  </div>
                </div>
              </div>

              {/* Yatay Kaydırılabilir Ekran Kartları */}
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4">
                  {[
                    { title: "İşletme Takvim Ekranı", icon: "📅" },
                    { title: "Hizmet Yönetimi", icon: "⚙️" },
                    { title: "Personel Yönetimi", icon: "👥" },
                    { title: "İstatistik Dashboard", icon: "📊" },
                    { title: "Online Randevu Sayfası", icon: "🌐" },
                  ].map((screen, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 overflow-hidden rounded-xl border border-white/10 p-6 shadow-xl transition-all hover:border-white/20 hover:shadow-2xl" style={{ background: 'linear-gradient(to bottom right, rgba(26, 10, 10, 0.8), rgba(26, 10, 10, 0.8))', minWidth: "280px", width: "280px" }}
                    >
                      {/* Screen Mockup Header - Daha Detaylı */}
                      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{screen.icon}</span>
                          <div className="space-y-1">
                            <div className="h-2 w-24 rounded bg-white/15" />
                            <div className="h-1.5 w-16 rounded bg-white/8" />
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <div className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: '#1a0a0a' }} />
                          <div className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: '#1a0a0a' }} />
                        </div>
                      </div>

                      {/* Screen Content - Daha Gerçekçi */}
                      <div className="space-y-3">
                        {screen.title === "İşletme Takvim Ekranı" ? (
                          <>
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between rounded-lg border border-white/10 p-2" style={{ backgroundColor: '#1a0a0a' }}>
                              <div className="h-2 w-16 rounded bg-white/10" />
                              <div className="flex gap-1">
                                <div className="h-3 w-3 rounded border border-white/10" />
                                <div className="h-3 w-3 rounded border border-white/10" />
                              </div>
                            </div>
                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: 21 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`aspect-square rounded border text-[8px] ${
                                    i === 8 || i === 15
                                      ? "border-white/30 text-white/90"
                                      : i < 7
                                      ? "border-transparent bg-transparent"
                                      : "border-white/10 text-slate-300"
                                  } flex items-center justify-center`}
                                >
                                  {i >= 7 && i - 6}
                                </div>
                              ))}
                            </div>
                            {/* Time Slots */}
                            <div className="space-y-1.5 pt-2">
                              <div className="h-1.5 w-20 rounded bg-white/10" />
                              <div className="flex gap-1.5">
                                {["09:00", "10:00", "11:00", "14:00"].map((time, i) => (
                                  <div
                                    key={time}
                                    className={`flex-1 rounded border py-1.5 text-center text-[9px] ${
                                      i === 1
                                        ? "border-white/30 text-white/90"
                                        : "border-white/10 text-slate-300"
                                    }`}
                                  >
                                    {time}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : screen.title === "Hizmet Yönetimi" ? (
                          <>
                            {/* Service List */}
                            <div className="space-y-2">
                              {[
                                { name: "Saç Kesimi", duration: "30 dk", price: "₺150" },
                                { name: "Sakal Tıraşı", duration: "20 dk", price: "₺80" },
                                { name: "Saç Boyama", duration: "90 dk", price: "₺350" },
                              ].map((service, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 rounded-lg border border-white/10 p-2.5" style={{ backgroundColor: '#1a0a0a' }}
                                >
                                  <div className="h-8 w-8 rounded" style={{ background: 'linear-gradient(to bottom right, rgba(45, 10, 10, 0.3), rgba(26, 10, 10, 0.3))' }} />
                                  <div className="flex-1 space-y-1">
                                    <div className="h-2.5 w-full rounded bg-white/15" />
                                    <div className="flex gap-2">
                                      <div className="h-1.5 w-12 rounded bg-white/8" />
                                      <div className="h-1.5 w-16 rounded bg-amber-900/30" />
                                    </div>
                                  </div>
                                  <div className="h-5 w-5 rounded border border-white/10" style={{ backgroundColor: '#1a0a0a' }} />
                                </div>
                              ))}
                            </div>
                          </>
                        ) : screen.title === "Personel Yönetimi" ? (
                          <>
                            {/* Staff List */}
                            <div className="space-y-2">
                              {[
                                { name: "Ahmet Yılmaz", role: "Berber" },
                                { name: "Mehmet Demir", role: "Berber" },
                                { name: "Ayşe Kaya", role: "Kuaför" },
                              ].map((staff, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 rounded-lg border border-white/10 p-2.5" style={{ backgroundColor: '#1a0a0a' }}
                                >
                                  <div className="h-10 w-10 rounded-full" style={{ background: 'linear-gradient(to bottom right, rgba(45, 10, 10, 0.3), rgba(26, 10, 10, 0.3))' }} />
                                  <div className="flex-1 space-y-1">
                                    <div className="h-2.5 w-24 rounded bg-white/15" />
                                    <div className="h-1.5 w-16 rounded bg-white/8" />
                                  </div>
                                  <div className={`h-2 w-2 rounded-full ${i === 1 ? "bg-emerald-500" : ""}`} style={i !== 1 ? { backgroundColor: '#3d0a0a' } : undefined} />
                                </div>
                              ))}
                            </div>
                          </>
                        ) : screen.title === "İstatistik Dashboard" ? (
                          <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: "Toplam", value: "1,234", color: "blue" },
                                { label: "Bu Ay", value: "567", color: "green" },
                                { label: "Onaylanan", value: "890", color: "amber" },
                                { label: "İptal", value: "123", color: "red" },
                              ].map((stat, i) => (
                                <div
                                  key={i}
                                  className="rounded-lg border border-white/10 p-2.5" style={{ backgroundColor: '#1a0a0a' }}
                                >
                                  <div className="h-1.5 w-12 rounded bg-white/8 mb-1.5" />
                                  <div className="h-4 w-16 rounded bg-white/15" />
                                </div>
                              ))}
                            </div>
                            {/* Chart Placeholder */}
                            <div className="h-20 rounded-lg border border-white/10 p-2" style={{ backgroundColor: '#1a0a0a' }}>
                              <div className="flex h-full items-end justify-between gap-1">
                                {Array.from({ length: 7 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="flex-1 rounded-t" 
                                    style={{ 
                                      background: 'linear-gradient(to top, rgba(45, 10, 10, 0.4), rgba(61, 10, 10, 0.2))', 
                                      height: chartHeights[i] ? `${chartHeights[i]}%` : '40%' 
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Online Booking Page */}
                            <div className="space-y-3">
                              {/* Business Header */}
                              <div className="flex items-center gap-3 rounded-lg border border-white/10 p-3" style={{ backgroundColor: '#1a0a0a' }}>
                                <div className="h-12 w-12 rounded-xl" style={{ background: 'linear-gradient(to bottom right, #2d0a0a, #1a0a0a)' }} />
                                <div className="flex-1 space-y-1">
                                  <div className="h-2.5 w-32 rounded bg-white/15" />
                                  <div className="h-1.5 w-24 rounded bg-white/8" />
                                </div>
                              </div>
                              {/* Service Selection */}
                              <div className="space-y-2">
                                <div className="h-1.5 w-20 rounded bg-white/10" />
                                {[1, 2].map((i) => (
                                  <div
                                    key={i}
                                    className="rounded-lg border border-white/10 p-2" style={{ backgroundColor: '#1a0a0a' }}
                                  >
                                    <div className="h-2 w-full rounded bg-white/10" />
                                  </div>
                                ))}
                              </div>
                              {/* Date Picker */}
                              <div className="rounded-lg border border-white/10 p-2" style={{ backgroundColor: '#1a0a0a' }}>
                                <div className="h-2 w-16 rounded bg-white/10 mb-2" />
                                <div className="grid grid-cols-7 gap-1">
                                  {Array.from({ length: 7 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`aspect-square rounded border text-[8px] ${
                                        i === 3
                                          ? "border-white/30"
                                          : "border-white/10 bg-white/5"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Screen Title */}
                      <div className="mt-4 border-t border-white/10 pt-3 text-center">
                        <p className="text-xs font-medium text-slate-300">{screen.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span>Kaydırarak diğer ekranları görüntüleyin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10">
        <section id="about" className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="rounded-[32px] border border-white/10 px-8 py-12 shadow-xl shadow-black/20 backdrop-blur" style={{ backgroundColor: '#1a0a0a' }}>
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Türkiye&apos;de geliştirilen, dünya standartlarında bir randevu yönetim platformu.
                </h2>
                <p className="mt-6 text-base text-slate-200/80">
                  2019&apos;dan bu yana berber, kuaför, güzellik salonu, pilates ve terapi merkezlerinden medikal estetisyenlere kadar 16.000&apos;den fazla işletme
                  Randevum ile randevu ve operasyon yönetimini sürdürüyor. Ekiplerinizin performansını artırın,
                  müşterilerinizle iletişimi güçlendirin ve işletmenizi dijital çağa taşıyın.
                </p>
                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  {[
                    { title: "81 ilde aktif", subtitle: "Türkiye geneline yayılan geniş ağ" },
                    { title: "%98 müşteri bağlılığı", subtitle: "Yenilenen abonelik oranı" },
                    { title: "Güncel mevzuata uyum", subtitle: "KVKK ve e-fatura entegrasyonları" },
                    { title: "Anlık destek", subtitle: "Uzman ekibimiz sadece bir mesaj uzağınızda" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/5 p-5" style={{ backgroundColor: '#1a0a0a' }}>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-200/70">{item.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 rounded-3xl border border-white/5 p-8 shadow-inner" style={{ backgroundColor: 'rgba(26, 10, 10, 0.06)', boxShadow: 'inset 0 2px 4px 0 rgba(45, 10, 10, 0.1)' }}>
                {coreFeatures.map((feature) => (
                  <div key={feature.title} className="rounded-2xl p-6" style={{ backgroundColor: '#1a0a0a' }}>
                    <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    <p className="mt-3 text-sm text-slate-200/75">{feature.description}</p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-200/60">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2">
                          <span aria-hidden className="inline-block h-4 w-4 rounded-full" style={{ background: 'linear-gradient(to right, #2d0a0a, #1a0a0a)' }} />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-semibold text-white">
                Tüm ekibinizi tek platformda buluşturun
              </h2>
              <p className="text-base text-slate-200/75">
                Randevum; randevu planlama, personel yönetimi, stok takibi ve müşteriye yönelik
                iletişim araçlarını tek panelde sunar. İşletmenizin büyüklüğü ne olursa olsun,
                tüm süreçleri uçtan uca yönetirsiniz.
              </p>
              <div className="grid gap-4 text-sm text-slate-200/70">
                {[
                  "Tablet ve mobil cihazlardan anlık randevu oluşturma",
                  "Erken hatırlatma SMS/e-posta otomasyonları",
                  "Kabinde/masada check-in ile zaman yönetimi",
                  "Rapor merkezinden günlük gelir ve performans takibi",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3" style={{ backgroundColor: '#1a0a0a' }}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(to bottom right, #2d0a0a, #1a0a0a)' }}>
                      ✔
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 rounded-[28px] border border-white/10 p-10 shadow-lg shadow-black/20 backdrop-blur" style={{ backgroundColor: '#131010' }}>
              <h3 className="text-lg font-semibold text-white">
                Müşterileriniz, işletmenize bir dokunuş uzaklıkta
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    title: "Mobil uygulama",
                    description: "iOS ve Android uygulamamızla müşterileriniz 7/24 randevu oluşturur.",
                  },
                  {
                    title: "Self servis yönetim",
                    description: "Randevu erteleme/iptal süreçlerinde personeliniz yorulmaz.",
                  },
                  {
                    title: "Sadakat programı",
                    description: "Puan ve kampanya kurguları ile müşterileriniz geri gelir.",
                  },
                  {
                    title: "Google Rezervasyon",
                    description: "Google işletme profilinizle entegre randevu alma deneyimi.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                    <p className="mt-2 text-sm text-slate-200/70">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(to right, rgba(45, 10, 10, 0.3), rgba(26, 10, 10, 0.3), rgba(10, 5, 5, 0.3))' }}>
                <p className="text-sm text-slate-100">
                  “Randevum sayesinde müşterilerimiz tek tıkla rezervasyon oluşturuyor, biz de ekibimizin
                  boşluklarını anında doldurabiliyoruz. Operasyon yükü en az %40 azaldı.”
                </p>
                <p className="mt-3 text-sm font-semibold text-white">Nilay G., Glow Beauty Kurucusu</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="grid gap-10 rounded-[32px] border border-white/10 p-10 shadow-xl shadow-black/20 backdrop-blur lg:grid-cols-[1fr_1.1fr]" style={{ backgroundColor: '#1a0a0a' }}>
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90" style={{ backgroundColor: '#1a0a0a' }}>
                Mobil deneyim
              </span>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Uygulamamızı indirin, müşterilerinize 7/24 randevu imkanı sunun
              </h2>
              <p className="text-base text-slate-200/75">
                Randevum iOS ve Android uygulamalarını kendi logonuzla markalayabilir, müşterilerinize
                App Store ve Google Play üzerinden sunabilirsiniz.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="#"
                  className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/50" style={{ backgroundColor: '#1a0a0a' }}
                >
                   App Store&apos;dan indir
                </Link>
                <Link
                  href="#"
                  className="flex items-center justify-center gap-3 rounded-2xl border border-white/15 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/50" style={{ backgroundColor: '#1a0a0a' }}
                >
                  ▶ Google Play&apos;den indir
                </Link>
              </div>
              <div className="grid gap-4 pt-4 sm:grid-cols-2">
                {[
                  { title: "Push bildirimleri", desc: "Gelmek üzere olan randevular için hatırlatma" },
                  { title: "Canlı durum", desc: "Kabinde servis alan müşteriyi tek dokunuşla güncelleyin" },
                  { title: "Satış sonrası mesaj", desc: "Otomatik memnuniyet anketleri ve değerlendirme" },
                  { title: "Kampanya kuponu", desc: "Hedef kitlenize özel indirimler oluşturun" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-200/80"
                  >
                    <span className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(to bottom right, #2d0a0a, #1a0a0a)' }}>
                      ✦
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="mt-1 text-xs text-slate-200/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mobil Uygulama Görselleri */}
            <div className="relative flex items-center justify-center">
              <div className="relative flex gap-6">
                {/* iPhone Mockup */}
                <div className="relative z-10">
                  <div className="relative h-[600px] w-[300px] rounded-[3rem] border-[12px] p-2 shadow-2xl" style={{ borderColor: '#1a0a0a', backgroundColor: '#1a0a0a' }}>
                    <div className="relative h-full w-full overflow-hidden rounded-[2rem]" style={{ background: 'linear-gradient(to bottom right, #1a0a0a, #0a0505)' }}>
                      {/* Görsel varsa göster, yoksa placeholder */}
                      <div className="absolute inset-0">
                        {/* Görsel eklemek için: web/public/images/mobile-app-ios.png dosyasını oluşturun */}
                        {/* <Image
                          src="/images/mobile-app-ios.png"
                          alt="iOS App Screenshot"
                          fill
                          className="object-cover"
                          priority
                        /> */}
                      </div>
                      {/* Placeholder - Görsel yoksa gösterilir */}
                      <div className="flex h-full flex-col">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between px-6 pt-3 pb-2">
                          <span className="text-xs font-semibold text-white">9:41</span>
                          <div className="flex gap-1">
                            <div className="h-1 w-1 rounded-full bg-white"></div>
                            <div className="h-1 w-1 rounded-full bg-white"></div>
                            <div className="h-1 w-1 rounded-full bg-white"></div>
                          </div>
                        </div>
                        {/* App Content Placeholder */}
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
                          <div className="h-16 w-16 rounded-2xl" style={{ background: 'linear-gradient(to bottom right, #3d0a0a, #2d0a0a)' }}></div>
                          <div className="h-4 w-32 rounded" style={{ backgroundColor: '#2d0a0a' }}></div>
                          <div className="h-3 w-24 rounded" style={{ backgroundColor: '#2d0a0a' }}></div>
                          <div className="mt-4 w-full space-y-2">
                            <div className="h-12 w-full rounded-xl" style={{ backgroundColor: 'rgba(45, 10, 10, 0.5)' }}></div>
                            <div className="h-12 w-full rounded-xl" style={{ backgroundColor: 'rgba(45, 10, 10, 0.5)' }}></div>
                            <div className="h-12 w-full rounded-xl" style={{ backgroundColor: 'rgba(45, 10, 10, 0.5)' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Android Mockup */}
                <div className="relative z-0 translate-y-12">
                  <div className="relative h-[600px] w-[300px] rounded-[2rem] border-[8px] p-2 shadow-2xl" style={{ borderColor: '#1a0a0a', backgroundColor: '#1a0a0a' }}>
                    <div className="relative h-full w-full overflow-hidden rounded-xl" style={{ background: 'linear-gradient(to bottom right, #1a0a0a, #0a0505)' }}>
                      {/* Görsel varsa göster, yoksa placeholder */}
                      <div className="absolute inset-0">
                        {/* Görsel eklemek için: web/public/images/mobile-app-android.png dosyasını oluşturun */}
                        {/* <Image
                          src="/images/mobile-app-android.png"
                          alt="Android App Screenshot"
                          fill
                          className="object-cover"
                          priority
                        /> */}
                      </div>
                      {/* Placeholder - Görsel yoksa gösterilir */}
                      <div className="flex h-full flex-col">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between px-4 pt-2 pb-1">
                          <span className="text-xs font-semibold text-white">9:41</span>
                          <div className="flex gap-1">
                            <div className="h-1 w-1 rounded-full bg-white"></div>
                            <div className="h-1 w-1 rounded-full bg-white"></div>
                            <div className="h-1 w-1 rounded-full bg-white"></div>
                          </div>
                        </div>
                        {/* App Content Placeholder */}
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
                          <div className="h-16 w-16 rounded-2xl" style={{ background: 'linear-gradient(to bottom right, #3d0a0a, #2d0a0a)' }}></div>
                          <div className="h-4 w-32 rounded" style={{ backgroundColor: '#2d0a0a' }}></div>
                          <div className="h-3 w-24 rounded" style={{ backgroundColor: '#2d0a0a' }}></div>
                          <div className="mt-4 w-full space-y-2">
                            <div className="h-12 w-full rounded-xl" style={{ backgroundColor: 'rgba(45, 10, 10, 0.5)' }}></div>
                            <div className="h-12 w-full rounded-xl" style={{ backgroundColor: 'rgba(45, 10, 10, 0.5)' }}></div>
                            <div className="h-12 w-full rounded-xl" style={{ backgroundColor: 'rgba(45, 10, 10, 0.5)' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
          <div className="rounded-[32px] border border-white/10 p-10 shadow-xl shadow-black/20 backdrop-blur" style={{ backgroundColor: '#1a0a0a' }}>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-6">
                <span className="inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90" style={{ backgroundColor: '#1a0a0a' }}>
                  Randevu talebi
                </span>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                  Müşterileriniz web üzerinden de saniyeler içinde randevu talebinde bulunsun
                </h2>
                <p className="text-base text-slate-200/75">
                  Web formlarından gelen talepler işletme panelinize düşer, dilerseniz otomatik olarak takvime
                  eklenir. Onayladığınız anda müşterinize SMS veya e-posta ile bilgilendirme gönderebilirsiniz.
                </p>
                <ul className="space-y-3 text-sm text-slate-200/70">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs text-white">
                      ✓
                    </span>
                    Hizmet ve şube seçimi ile doğru personele yönlendirme
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs text-white">
                      ✓
                    </span>
                    Boş saatleri dolduracak otomatik hatırlatma akışları
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs text-white">
                      ✓
                    </span>
                    Raporlama ekranlarında web, mobil ve çağrı merkezi kayıtlarının tek yerde toplanması
                  </li>
                </ul>
              </div>
              <div className="rounded-[28px] border border-white/15 p-8 shadow-lg shadow-black/20" style={{ backgroundColor: '#1a0a0a' }}>
                <BookingForm />
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Showcase */}
        <section id="integrations" className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Popüler platformlarla entegre çalışır
            </h2>
            <p className="mt-4 text-base text-slate-200/70">
              Randevum, işletmenizin kullandığı araçlarla sorunsuz entegre olur. Tek platformdan her şeyi yönetin.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "WhatsApp Business",
                description: "Müşterileriniz WhatsApp üzerinden direkt randevu alabilir. Mesajlarınız otomatik yanıtlanır.",
                icon: "💬",
                category: "İletişim",
              },
              {
                name: "Instagram",
                description: "Instagram profilinizden veya hikayelerinizden randevu linkini paylaşın, anında rezervasyon alın.",
                icon: "📸",
                category: "Sosyal Medya",
              },
              {
                name: "Google Calendar",
                description: "Randevularınız Google Takvim ile senkronize olur. Çift rezervasyon riski ortadan kalkar.",
                icon: "📅",
                category: "Takvim",
              },
              {
                name: "iyzico",
                description: "Güvenli ödeme altyapısı ile abonelik tahsilatınızı otomatikleştirin. Ödeme hatırlatmaları otomatik.",
                icon: "💳",
                category: "Ödeme",
              },
              {
                name: "NetGSM",
                description: "SMS hatırlatmaları ve bildirimleri otomatik gönderin. Müşteri iletişimini güçlendirin.",
                icon: "📱",
                category: "SMS",
              },
              {
                name: "Google My Business",
                description: "Google işletme profilinizden direkt randevu alın. Yerel aramalarda öne çıkın.",
                icon: "🔍",
                category: "SEO & Pazarlama",
              },
            ].map((integration, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-white/10 p-6 transition-all hover:border-white/30 hover:shadow-xl hover:shadow-[0_20px_25px_-5px_rgba(45,10,10,0.2)]" style={{ background: 'linear-gradient(to bottom right, rgba(26, 10, 10, 0.7), rgba(26, 10, 10, 0.7))' }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl backdrop-blur" style={{ background: 'linear-gradient(to bottom right, rgba(45, 10, 10, 0.3), rgba(26, 10, 10, 0.3))' }}>
                    {integration.icon}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                      <span className="rounded-full border border-white/10 bg-slate-950/80 px-2 py-0.5 text-xs text-slate-300">
                        {integration.category}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300/70">{integration.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-300/70">
              Daha fazla entegrasyon mu istiyorsunuz?{" "}
              <Link href="#contact" className="font-semibold underline text-white/80 hover:text-white/90" style={{ color: '#8a0a0a' }}>
                Bizimle iletişime geçin
              </Link>
            </p>
          </div>
        </section>

        {/* Use Cases / Case Studies */}
        <section id="use-cases" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Sektörünüze özel çözümler
            </h2>
            <p className="mt-4 text-base text-slate-200/70">
              Her işletme türü için optimize edilmiş özellikler ve iş akışları
            </p>
          </div>

          <div className="mt-12">
            {/* Yatay kaydırılabilir container */}
            <div className="scrollbar-hide -mx-6 overflow-x-auto px-6 lg:-mx-8 lg:px-8">
              <div className="flex gap-6 pb-4">
                {[
                  {
                    title: "Berberler için",
                    icon: "✂️",
                    description: "Hızlı randevu döngüsü, müşteri geçmişi ve favori berber seçimi ile berber dükkanlarınızı dijitalleştirin.",
                    features: [
                      "Hızlı check-in/check-out sistemi",
                      "Müşteri saç tipi ve tercihleri kaydı",
                      "Personel bazlı randevu yönetimi",
                      "Sakal tıraşı + saç kesimi kombine paketleri",
                    ],
                    stats: { value: "5.200+", label: "Aktif berber dükkanı" },
                    testimonial: {
                      quote: "Müşterilerimiz artık telefon açmadan randevu alıyor. Boş saatlerimiz %60 azaldı.",
                      author: "Mehmet Yılmaz",
                      business: "Fresh Barber, İstanbul",
                    },
                  },
                  {
                    title: "Güzellik Salonları için",
                    icon: "💅",
                    description: "Çoklu hizmet yönetimi, süre bazlı planlama ve müşteri bakım geçmişi ile güzellik salonlarınızı yönetin.",
                    features: [
                      "Uzun süreli randevu planlaması (saç boyama, kaş laminasyonu)",
                      "Hizmet kombinasyonları ve paket fiyatlandırması",
                      "Müşteri cilt tipi ve alerji kayıtları",
                      "Ürün stok takibi ve satış yönetimi",
                    ],
                    stats: { value: "4.800+", label: "Aktif güzellik salonu" },
                    testimonial: {
                      quote: "Randevum sayesinde müşteri memnuniyetimiz arttı. Tekrar gelme oranı %45 yükseldi.",
                      author: "Ayşe Demir",
                      business: "Glow Beauty Studio, Ankara",
                    },
                  },
                  {
                    title: "Pilates ve Fitness Merkezleri için",
                    icon: "🧘",
                    description: "Grup dersleri, özel dersler ve paket yönetimi ile spor merkezlerinizi tek platformdan yönetin.",
                    features: [
                      "Grup ders kapasitesi yönetimi",
                      "Bireysel antrenör randevuları",
                      "Paket satışı ve kullanım takibi",
                      "Ders iptal ve bekleme listesi yönetimi",
                    ],
                    stats: { value: "2.100+", label: "Aktif spor merkezi" },
                    testimonial: {
                      quote: "Ders doluluk oranımız %85'e çıktı. Bekleme listesi sayesinde iptal olan yerler anında doluyor.",
                      author: "Can Özkan",
                      business: "FitZone Pilates, İzmir",
                    },
                  },
                  {
                    title: "Psikolog ve Terapi Merkezleri için",
                    icon: "🧠",
                    description: "Gizlilik odaklı, uzun süreli randevu planlaması ve müşteri dosya yönetimi ile sağlık merkezlerinizi dijitalleştirin.",
                    features: [
                      "Uzun süreli randevu planlaması (haftalık/aylık)",
                      "Gizlilik ve KVKK uyumlu veri yönetimi",
                      "Müşteri seans geçmişi ve notları",
                      "Ödeme planları ve fatura entegrasyonu",
                    ],
                    stats: { value: "1.500+", label: "Aktif terapi merkezi" },
                    testimonial: {
                      quote: "Randevu yönetimi artık çok kolay. Müşterilerim online randevu alıyor, ben sadece onaylıyorum.",
                      author: "Dr. Zeynep Kaya",
                      business: "Mindful Therapy Center, İstanbul",
                    },
                  },
                  {
                    title: "Medikal Estetik ve Klinikler için",
                    icon: "🏥",
                    description: "Tıbbi randevu yönetimi, hasta dosyaları ve işlem geçmişi ile kliniklerinizi profesyonelce yönetin.",
                    features: [
                      "Tıbbi işlem bazlı randevu planlaması",
                      "Hasta dosya yönetimi ve geçmiş kayıtları",
                      "Ön muayene formları ve onam belgeleri",
                      "E-fatura ve mali entegrasyonlar",
                    ],
                    stats: { value: "2.400+", label: "Aktif klinik" },
                    testimonial: {
                      quote: "Hasta randevu yönetimi artık çok daha profesyonel. Randevu hatası neredeyse sıfıra indi.",
                      author: "Dr. Emre Şahin",
                      business: "Aesthetic Clinic, İstanbul",
                    },
                  },
                ].map((useCase, index) => (
                  <div
                    key={index}
                    className="flex min-w-[420px] max-w-[420px] flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 shadow-xl backdrop-blur transition-all hover:border-white/30 hover:shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(45,10,10,0.2)]" style={{ background: 'linear-gradient(to bottom right, rgba(26, 10, 10, 0.7), rgba(26, 10, 10, 0.7))' }}
                  >
                    <div className="flex flex-1 flex-col p-6">
                      {/* Header */}
                      <div className="mb-4 flex items-start gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl backdrop-blur" style={{ background: 'linear-gradient(to bottom right, rgba(45, 10, 10, 0.3), rgba(26, 10, 10, 0.3))' }}>
                          {useCase.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white">{useCase.title}</h3>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-xl font-bold" style={{ color: '#8a0a0a' }}>{useCase.stats.value}</span>
                            <span className="text-xs text-slate-300/70">{useCase.stats.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="mb-4 text-sm leading-relaxed text-slate-200/80">{useCase.description}</p>

                      {/* Features */}
                      <div className="mb-4 space-y-2">
                        {useCase.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg border border-white/10 bg-slate-950/80 p-2.5">
                            <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] text-white/90" style={{ backgroundColor: 'rgba(45, 10, 10, 0.3)' }}>
                              ✓
                            </span>
                            <span className="text-xs leading-relaxed text-slate-200/80">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Testimonial */}
                      <div className="mt-auto rounded-xl border border-white/10 bg-slate-950/80 p-4">
                        <div className="mb-2 flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className="h-4 w-4" style={{ color: '#8a0a0a' }}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <blockquote className="mb-3 text-xs italic leading-relaxed text-slate-200/90">
                          &ldquo;{useCase.testimonial.quote}&rdquo;
                        </blockquote>
                        <div className="border-t border-white/10 pt-2">
                          <p className="text-xs font-semibold text-white">{useCase.testimonial.author}</p>
                          <p className="text-[10px] text-slate-300/70">{useCase.testimonial.business}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ShopsShowcase />

        <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-semibold text-white">İşletmenize uygun planı seçin</h2>
            <p className="mt-4 text-base text-slate-200/70">
              7 günlük ücretsiz deneme ile tüm özellikleri keşfedin. İsterseniz dilediğiniz an iptal edin.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex h-full flex-col rounded-[28px] border border-white/10 p-8 shadow-lg shadow-black/20 backdrop-blur transition hover:border-white/30 ${
                  plan.highlighted ? "outline outline-2 outline-amber-700/60" : ""
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-200/70">{plan.description}</p>
                </div>
                <p className="text-3xl font-semibold text-white">
                  {plan.price}
                  {plan.price !== "Teklif Alın" && <span className="text-base font-normal text-slate-200/70"> / ay</span>}
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-200/70">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs text-white">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="#contact"
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                    plan.highlighted
                      ? "text-white shadow-lg"
                      : "border border-white/20 text-white hover:border-white/60"
                  }`}
                  style={plan.highlighted ? { background: 'linear-gradient(to right, #2d0a0a, #1a0a0a, #0a0505)', boxShadow: '0 10px 15px -3px rgba(45, 10, 10, 0.3)' } : undefined}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="references" className="mx-auto max-w-6xl px-6 pb-24 lg:px-8">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-10 shadow-inner shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-6 text-center">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Sektör liderlerinin tercihi
              </h2>
              <p className="mx-auto max-w-2xl text-base text-slate-200/70">
                Türkiye genelindeki berber, kuaför, güzellik salonu, pilates ve terapi merkezleri Randevum ile operasyonlarını
                sadeleştiriyor.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                {references.map((brand) => (
                  <div
                    key={brand}
                    className="rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-8 text-lg font-semibold text-white shadow-lg shadow-black/10"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-6 pb-24 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Sık sorulan sorular
            </h2>
            <p className="mt-4 text-base text-slate-200/70">
              Aklınıza takılan başka sorular için canlı destek ekibimizle iletişime geçebilirsiniz.
            </p>
          </div>
          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-5 text-left transition"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-white transition group-open:text-white/90" style={{ color: 'inherit' }}>
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-slate-200/70">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-6 pb-32 lg:px-8">
          <div className="grid gap-10 rounded-[32px] border border-white/10 bg-slate-900/70 p-10 shadow-xl shadow-black/20 backdrop-blur lg:grid-cols-[0.7fr_1.3fr]">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-white">
                Başlamaya hazır mısınız?
              </h2>
              <p className="text-sm text-slate-200/75">
                Formu doldurun, danışmanlarımız işletmenize en uygun çözümü belirlemek için sizi arasın.
              </p>
              <div className="space-y-4 text-sm text-slate-200/70">
                <p>
                  <span className="text-white">Telefon:</span> 0539 240 11 11
                </p>
                <p>
                  <span className="text-white">E-posta:</span> randevum.iletisim@gmail.com
                </p>
                <p>
                  <span className="text-white">Çalışma Saatleri:</span> 7/24 ulaşılabilir
                </p>
              </div>
            </div>
            <ContactForm />
        </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10" style={{ backgroundColor: '#1C1411' }}>
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          {/* Ana Footer İçeriği */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Randevum Hakkında */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: 'linear-gradient(to bottom right, #2d0a0a, #1a0a0a, #0a0505)' }}>
                  Rv
                </span>
                <h3 className="text-xl font-bold text-white">Randevum</h3>
              </div>
              <p className="text-sm text-slate-300/80 leading-relaxed mb-6 max-w-md">
                Randevu sistemi ile çalışan işletmeler için tek platform. 
                Berberden pilatese, psikologdan kliniğe tüm randevulu işletmeler için.
              </p>
              <p className="text-xs text-slate-400/70">
                Berber, kuaför, güzellik salonu, pilates ve terapi merkezleri için uçtan uca işletme yönetimi. 
                KVKK, Mesafeli Satış ve BGYS politikalarımız kullanıcı panelinden erişilebilir.
              </p>
            </div>

            {/* Yasal Linkler */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">Yasal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-slate-300/70 hover:text-white transition-colors inline-block">
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-slate-300/70 hover:text-white transition-colors inline-block">
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-slate-300/70 hover:text-white transition-colors inline-block">
                    Kullanım Koşulları
                  </Link>
                </li>
                <li>
                  <Link href="/delivery-return" className="text-sm text-slate-300/70 hover:text-white transition-colors inline-block">
                    Teslimat ve İade Şartları
                  </Link>
                </li>
                <li>
                  <Link href="/distance-sales" className="text-sm text-slate-300/70 hover:text-white transition-colors inline-block">
                    Mesafeli Satış Sözleşmesi
                  </Link>
                </li>
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">İletişim</h4>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:randevum.iletisim@gmail.com" 
                    className="text-sm text-slate-300/70 hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    randevum.iletisim@gmail.com
                  </a>
                </li>
                <li>
                  <a 
                    href="tel:+905392401111" 
                    className="text-sm text-slate-300/70 hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0539 240 11 11
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Ödeme Logoları ve Copyright */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Ödeme Logoları */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-xs text-slate-400/70 font-medium">Güvenli Ödeme:</p>
                <div className="flex items-center gap-3">
                  {/* Visa Logo */}
                  <div className="flex items-center justify-center bg-white rounded-lg px-4 py-2.5 h-12 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-blue-600 font-bold text-base tracking-wider">VISA</span>
                  </div>
                  {/* MasterCard Logo */}
                  <div className="flex items-center justify-center bg-white rounded-lg px-4 py-2.5 h-12 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-red-500"></div>
                      <div className="w-7 h-7 rounded-full bg-yellow-500 -ml-3.5"></div>
                    </div>
                    <span className="text-orange-600 font-bold text-xs ml-2.5">Mastercard</span>
                  </div>
                  {/* iyzico Logo */}
                  <a 
                    href="https://www.iyzico.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-white rounded-lg px-4 py-2.5 h-12 shadow-sm hover:shadow-md transition-all"
                  >
                    <img 
                      src="/iyzico-logo.png" 
                      alt="iyzico ile Öde" 
                      className="h-7 object-contain"
                    />
                  </a>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-center md:text-right">
                <p className="text-xs text-slate-400/70">
                  © {new Date().getFullYear()} Randevum. Tüm hakları saklıdır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
