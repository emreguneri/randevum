"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const WEEK_DAYS = [
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
  { value: 0, label: "Pazar" },
];

interface ServiceInput {
  name: string;
  duration: number; // minutes
  price: number;
}

export default function ShopSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [services, setServices] = useState<ServiceInput[]>([
    { name: "Saç Kesimi", duration: 45, price: 350 },
  ]);
  const [openingHour, setOpeningHour] = useState("09:00");
  const [closingHour, setClosingHour] = useState("20:00");
  const [workingDays, setWorkingDays] = useState<number[]>(WEEK_DAYS.map((day) => day.value));
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [staff, setStaff] = useState<string[]>([]);
  const [staffName, setStaffName] = useState("");
  const [loadingShop, setLoadingShop] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const shareBase = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || "https://onlinerandevum.com";

  useEffect(() => {
    const checkSubscription = async () => {
      if (loading) return;
      
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      if (user.role === "admin") {
        // Admin kullanıcılar devam edebilir
      } else {
        // Admin değilse login sayfasına yönlendir
        router.replace("/auth/login");
        return;
      }
      
      // Abonelik kontrolü - Firestore'dan güncel bilgiyi çek
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const subscriptionStatus = userData.subscriptionStatus;
            const subscriptionEndsAt = userData.subscriptionEndsAt;
            
            // Abonelik aktif değilse ödeme ekranına yönlendir
            if (subscriptionStatus !== "active") {
              router.replace("/payment");
              return;
            }
            
            // Abonelik süresi dolmuş mu kontrol et
            if (subscriptionEndsAt) {
              const endDate = typeof subscriptionEndsAt === "string" 
                ? new Date(subscriptionEndsAt) 
                : subscriptionEndsAt.toDate ? subscriptionEndsAt.toDate() : new Date(subscriptionEndsAt);
              const now = new Date();
              
              if (endDate < now) {
                // Abonelik süresi dolmuş
                router.replace("/payment");
                return;
              }
            }
          } else {
            // Kullanıcı dokümanı yoksa ödeme ekranına yönlendir
            router.replace("/payment");
            return;
          }
        } catch (error) {
          console.error("[ShopSettings] Subscription check error:", error);
          // Hata durumunda da ödeme ekranına yönlendir (güvenli taraf)
          router.replace("/payment");
          return;
        }
      } else {
        // UID yoksa ödeme ekranına yönlendir
        router.replace("/payment");
        return;
      }
    };
    
    checkSubscription();
  }, [loading, user, router]);

  useEffect(() => {
    if (!user?.uid) return;

    setLoadingShop(true);
    const shopQuery = query(collection(db, "shops"), where("ownerId", "==", user.uid));
    
    // Real-time listener ekle - app'ten yapılan değişiklikler otomatik güncellenecek
    const unsubscribe = onSnapshot(
      shopQuery,
      (snapshot) => {
        try {
          if (!snapshot.empty) {
            const shopDoc = snapshot.docs[0];
            const data = shopDoc.data();
            setDocId(shopDoc.id);
            setSlug(data.slug || "");
            setName(data.name || "");
            setAddress(data.address || "");
            setDescription(data.description || "");
            setLogo(data.logo || "");
            setPhotos(Array.isArray(data.photos) ? data.photos : []);
            setPhone(data.phone || "");
            setInstagramUrl(data.instagramUrl || "");
            setServices(data.services || []);
            setOpeningHour(data.workingHours?.start || "09:00");
            setClosingHour(data.workingHours?.end || "20:00");
            setWorkingDays(Array.isArray(data.workingDays) && data.workingDays.length > 0 ? data.workingDays : WEEK_DAYS.map((day) => day.value));
            setTimezone(data.timezone || "Europe/Istanbul");
            setStaff(data.staff || []);
          }
          setLoadingShop(false);
        } catch (error) {
          console.error("[ShopSettings] snapshot error", error);
          setLoadingShop(false);
        }
      },
      (error) => {
        console.error("[ShopSettings] listener error", error);
        setLoadingShop(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleServiceChange = (index: number, field: keyof ServiceInput, value: string) => {
    setServices((prev) =>
      prev.map((service, i) =>
        i === index
          ? {
              ...service,
              [field]: field === "name" ? value : Number(value),
            }
          : service
      )
    );
  };

  const addService = () => {
    setServices((prev) => [...prev, { name: "Yeni Hizmet", duration: 60, price: 500 }]);
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const addStaff = () => {
    if (staffName.trim() && !staff.includes(staffName.trim())) {
      setStaff((prev) => [...prev, staffName.trim()]);
      setStaffName("");
    }
  };

  const removeStaff = (index: number) => {
    setStaff((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleWorkingDay = (value: number) => {
    setWorkingDays((prev) =>
      prev.includes(value) ? prev.filter((day) => day !== value) : [...prev, value].sort((a, b) => {
        const order = WEEK_DAYS.map((day) => day.value);
        return order.indexOf(a) - order.indexOf(b);
      })
    );
  };

  const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!address.trim()) return null;
    
    try {
      // Google Maps Geocoding API kullan
      const apiKey = 'AIzaSyCEtk1HSycs-zPTNAQxrkLqBBw45tERfCQ';
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=tr&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT') {
        // Geocoding API yetkilendirilmemiş veya limit aşılmış - sessizce devam et
        console.warn('[Geocode] API not authorized or limit exceeded, continuing without location');
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('[Geocode] Error:', error);
      return null;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.uid) return;
    if (!slug.trim()) {
      setFeedback("Lütfen paylaşılabilir bağlantı için bir slug belirleyin.");
      return;
    }

    try {
      setFeedback("Kaydediliyor...");
      
      // Adres varsa geocoding yap
      let location = null;
      if (address.trim()) {
        location = await geocodeAddress(address);
        if (location) {
          console.log('[ShopSettings] Location geocoded:', location);
        } else {
          console.warn('[ShopSettings] Geocoding failed, continuing without location');
        }
      }

      const newDocId = slug.trim().toLowerCase();
      if (docId && docId !== newDocId) {
        await deleteDoc(doc(db, "shops", docId));
      }
      const shopData: any = {
        ownerId: user.uid,
        name,
        slug: slug.trim().toLowerCase(),
        address,
        description,
        logo: logo.trim() || null,
        photos: photos.filter((p) => p.trim().length > 0),
        phone: phone.trim() || null,
        instagramUrl: instagramUrl.trim() || null,
        services,
        workingHours: {
          start: openingHour,
          end: closingHour,
        },
        workingDays,
        timezone,
        shareUrl: `${shareBase}/book/${slug.trim().toLowerCase()}`,
        isPaymentActive: true, // Web'den eklenen işletmeler için aktif abonelik zaten kontrol edildi
        updatedAt: new Date().toISOString(),
      };

      // Staff varsa ekle (undefined yerine sadece varsa ekle)
      if (staff.length > 0) {
        shopData.staff = staff;
      }

      // Location varsa ekle (undefined yerine sadece varsa ekle)
      if (location) {
        shopData.location = location;
      }

      await setDoc(doc(db, "shops", newDocId), shopData);
      setDocId(newDocId);
      setFeedback("İşletme bilgileri kaydedildi.");
    } catch (error) {
      console.error("[ShopSettings] save error", error);
      setFeedback("Bilgiler kaydedilirken bir hata oluştu.");
    }
  };

  if (loading || loadingShop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur">
          <h1 className="text-3xl font-semibold text-white">İşletme Bilgileri</h1>
          <p className="mt-2 text-sm text-slate-200/70">
            Müşterileriniz bu bilgiler üzerinden işletmenizi görüntüler ve randevu alır. Değişiklikler anında
            web sitesinde güncellenir.
          </p>
          {slug && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-amber-200/90">
                Paylaşılabilir rezervasyon linkiniz:{" "}
                <a
                  href={`/book/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {`${shareBase}/book/${slug}`}
                </a>
              </p>
              {instagramUrl && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-xs font-semibold text-white">Instagram Entegrasyonu</p>
                  <div className="space-y-2 text-xs text-slate-200/80">
                    <p>Instagram bio'nuzda paylaşmak için:</p>
                    <code className="block rounded bg-black/30 px-2 py-1 text-amber-200">
                      {`${shareBase}/book/${slug}`}
                    </code>
                    <p className="mt-2">Instagram Stories'de paylaşmak için linki kopyalayın ve Stories'e ekleyin.</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${shareBase}/book/${slug}`);
                        setFeedback("Link kopyalandı! Instagram bio veya Stories'inize ekleyebilirsiniz.");
                      }}
                      className="mt-2 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      📋 Linki Kopyala
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-white/10 bg-white/[0.04] p-10 shadow-xl shadow-black/20">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-200/80">
              İşletme Adı
              <input
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="text-sm text-slate-200/80">
              Paylaşılabilir Slug
              <input
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/\s+/g, "-"))}
                placeholder="ornek-kuafor"
                required
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-200/80">Çalışma Günleri</p>
            <p className="mt-1 text-xs text-slate-300/60">
              Müşteriler yalnızca seçtiğiniz günlerde randevu alabilir. Kapalı olduğunuz günleri pasif bırakın.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const active = workingDays.includes(day.value);
                return (
                  <button
                    type="button"
                    key={day.value}
                    onClick={() => toggleWorkingDay(day.value)}
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      active
                        ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-100"
                        : "border-white/20 bg-white/5 text-slate-300 hover:border-white/40"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="text-sm text-slate-200/80">
            Açıklama
            <textarea
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="text-sm text-slate-200/80">
            Adres
            <textarea
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-200/80">
              Telefon
              <input
                type="tel"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 555 123 45 67"
              />
            </label>
            <label className="text-sm text-slate-200/80">
              Instagram Profil Linki
              <input
                type="url"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/behkanailstudio"
              />
              <p className="mt-1 text-xs text-slate-300/60">
                Instagram profil linkinizi ekleyin. Müşterileriniz Instagram'dan direkt randevu alabilir.
              </p>
            </label>
            <label className="text-sm text-slate-200/80">
              Logo URL
              <input
                type="url"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="mt-1 text-xs text-slate-300/60">
                İşletmenizin logosu için bir URL girin (Firebase Storage veya başka bir hosting)
              </p>
            </label>
          </div>

          {/* Logo Önizleme */}
          {logo && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs text-slate-300/60">Logo Önizleme:</p>
              <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/10">
                <img
                  src={logo}
                  alt="Logo önizleme"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Fotoğraflar */}
          <div>
            <label className="text-sm text-slate-200/80">
              Fotoğraflar
              <div className="mt-2 flex gap-2">
                <input
                  type="url"
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (photoUrl.trim()) {
                        setPhotos([...photos, photoUrl.trim()]);
                        setPhotoUrl("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (photoUrl.trim()) {
                      setPhotos([...photos, photoUrl.trim()]);
                      setPhotoUrl("");
                    }
                  }}
                  className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  Ekle
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-300/60">
                Fotoğraf URL'lerini ekleyin (Firebase Storage veya başka bir hosting)
              </p>
            </label>
            {photos.length > 0 && (
              <div className="mt-4 space-y-2">
                {photos.map((photo, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                      <img
                        src={photo}
                        alt={`Fotoğraf ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1 truncate text-xs text-slate-200/70">{photo}</div>
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      className="rounded-lg border border-amber-800/30 bg-amber-900/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-900/30"
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-slate-200/80">
              Açılış Saati
              <input
                type="time"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                value={openingHour}
                onChange={(e) => setOpeningHour(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-200/80">
              Kapanış Saati
              <input
                type="time"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                value={closingHour}
                onChange={(e) => setClosingHour(e.target.value)}
              />
            </label>
            <label className="text-sm text-slate-200/80">
              Saat Dilimi
              <input
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Hizmetler</h2>
              <button
                type="button"
                onClick={addService}
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white transition hover:border-white/60"
              >
                Hizmet Ekle
              </button>
            </div>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 md:grid-cols-3"
                >
                  <label className="text-sm text-slate-200/80">
                    Hizmet Adı
                    <input
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                    />
                  </label>
                  <label className="text-sm text-slate-200/80">
                    Süre (dakika)
                    <input
                      type="number"
                      min={15}
                      step={15}
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                      value={service.duration}
                      onChange={(e) => handleServiceChange(index, "duration", e.target.value)}
                    />
                  </label>
                  <label className="text-sm text-slate-200/80">
                    Ücret (₺)
                    <input
                      type="number"
                      min={0}
                      className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                      value={service.price}
                      onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                    />
                  </label>
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-sm text-amber-200 underline md:col-span-3"
                    >
                      Bu hizmeti kaldır
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personel Yönetimi */}
          <div>
            <p className="text-sm font-medium text-slate-200/80">Personel</p>
            <p className="mt-1 text-xs text-slate-300/60">
              Müşteriler randevu alırken personel seçebilir. Personel eklemezseniz "Fark Etmez" seçeneği gösterilir.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStaff())}
                placeholder="Personel adı (örn: Ahmet, Ayşe)"
              />
              <button
                type="button"
                onClick={addStaff}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Ekle
              </button>
            </div>
            {staff.length > 0 && (
              <div className="mt-3 space-y-2">
                {staff.map((name, index) => (
                  <div key={index} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                    <span className="text-sm text-white">{name}</span>
                    <button
                      type="button"
                      onClick={() => removeStaff(index)}
                      className="text-sm text-amber-200 underline"
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {feedback && (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {feedback}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-amber-900 via-slate-900 to-black px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:opacity-95"
          >
            Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}
