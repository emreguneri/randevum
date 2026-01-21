"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SubscriptionInfo {
  status: "active" | "inactive" | "trial" | "expired";
  planName: string;
  startDate: Date | null;
  endDate: Date | null;
  daysRemaining: number;
}

interface ShopInfo {
  id: string;
  name: string;
  slug: string;
  totalBookings: number;
  totalRevenue: number;
}

export default function ProfilePage() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [shops, setShops] = useState<ShopInfo[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showExtendModal, setShowExtendModal] = useState(false);

  // Abonelik süre seçenekleri (App Store fiyatları)
  const subscriptionPlans = [
    { months: 1, label: "1 Ay", price: 799.99 },
    { months: 3, label: "3 Ay", price: 2499.99 },
    { months: 6, label: "6 Ay", price: 4999.99 },
    { months: 12, label: "1 Yıl", price: 9999.99 },
  ];

  // Yönlendirme kontrolü
  useEffect(() => {
    if (initialized && !user) {
      router.replace("/auth/login");
    }
  }, [initialized, user, router]);

  // Kullanıcı verilerini yükle
  useEffect(() => {
    if (!user?.uid) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Abonelik bilgilerini hesapla
        const subInfo: SubscriptionInfo = {
          status: user.subscriptionStatus === "active" ? "active" : "inactive",
          planName: user.subscriptionStatus === "active" ? "Pro Plan" : "Ücretsiz",
          startDate: null,
          endDate: null,
          daysRemaining: 0,
        };

        // Firestore'dan subscription bilgilerini al
        if (user.role === "admin") {
          console.log("[Profile] Fetching subscription for userId:", user.uid);
          const subQuery = query(
            collection(db, "subscriptions"),
            where("userId", "==", user.uid)
          );
          const subSnap = await getDocs(subQuery);
          console.log("[Profile] Subscription query result:", subSnap.empty ? "empty" : subSnap.docs.length + " docs");
          
          if (!subSnap.empty) {
            const subData = subSnap.docs[0].data();
            console.log("[Profile] Subscription data:", subData);
            subInfo.startDate = subData.startDate?.toDate() || null;
            subInfo.endDate = subData.endDate?.toDate() || null;
            subInfo.planName = subData.planName || "Pro Plan";
            
            if (subInfo.endDate) {
              const now = new Date();
              const diffTime = subInfo.endDate.getTime() - now.getTime();
              subInfo.daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
              console.log("[Profile] Days remaining calculated:", subInfo.daysRemaining);
              
              if (subInfo.daysRemaining === 0 && user.subscriptionStatus === "active") {
                subInfo.status = "expired";
              }
            }
          }
        }
        setSubscription(subInfo);

        // İşletme bilgilerini al (admin ise)
        if (user.role === "admin") {
          const shopsQuery = query(
            collection(db, "shops"),
            where("ownerId", "==", user.uid)
          );
          const shopsSnap = await getDocs(shopsQuery);
          const shopsList: ShopInfo[] = [];
          
          for (const shopDoc of shopsSnap.docs) {
            const shopData = shopDoc.data();
            shopsList.push({
              id: shopDoc.id,
              name: shopData.name || "İsimsiz İşletme",
              slug: shopData.slug || "",
              totalBookings: 0,
              totalRevenue: 0,
            });
          }
          setShops(shopsList);

          // Randevu istatistiklerini al
          if (shopsList.length > 0) {
            const slugs = shopsList.map(s => s.slug).filter(Boolean);
            if (slugs.length > 0) {
              const bookingsQuery = query(
                collection(db, "bookings"),
                where("shopSlug", "in", slugs)
              );
              const bookingsSnap = await getDocs(bookingsQuery);
              
              let total = 0;
              let completed = 0;
              let pending = 0;
              let revenue = 0;

              bookingsSnap.docs.forEach(doc => {
                const data = doc.data();
                total++;
                if (data.status === "completed") {
                  completed++;
                  revenue += data.price || 0;
                } else if (data.status === "pending") {
                  pending++;
                }
              });

              setStats({
                totalBookings: total,
                completedBookings: completed,
                pendingBookings: pending,
                totalRevenue: revenue,
              });
            }
          }
        } else {
          // Müşteri istatistikleri
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("customerId", "==", user.uid)
          );
          const bookingsSnap = await getDocs(bookingsQuery);
          
          let total = 0;
          let completed = 0;
          let pending = 0;

          bookingsSnap.docs.forEach(doc => {
            const data = doc.data();
            total++;
            if (data.status === "completed") {
              completed++;
            } else if (data.status === "pending") {
              pending++;
            }
          });

          setStats({
            totalBookings: total,
            completedBookings: completed,
            pendingBookings: pending,
            totalRevenue: 0,
          });
        }
      } catch (error) {
        console.error("[Profile] Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Loading durumunda bekle
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
          <p className="text-slate-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // User yoksa yönlendirme yapılacak
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
          <p className="text-slate-300">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // İşletme sahibi: role === admin VE subscriptionStatus === active
  const isAdmin = user.role === "admin" && user.subscriptionStatus === "active";

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        {/* Header */}
        <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 px-8 py-8 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-2xl font-bold text-white">
                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.displayName || "Kullanıcı"}
                </h1>
                <p className="text-sm text-slate-300">{user.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isAdmin 
                      ? "bg-purple-500/20 text-purple-300" 
                      : "bg-blue-500/20 text-blue-300"
                  }`}>
                    {isAdmin ? "İşletme Sahibi" : "Müşteri"}
                  </span>
                  {isAdmin && (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.subscriptionStatus === "active"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {user.subscriptionStatus === "active" ? "Aktif Abonelik" : "Abonelik Yok"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/customer/settings"
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                ⚙️ Hesap Ayarları
              </Link>
              {!isAdmin && (
                <Link
                  href="/payment?upgrade=true"
                  className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  🏪 İşletme Sahibi Ol
                </Link>
              )}
              {isAdmin && user.subscriptionStatus !== "active" && (
                <Link
                  href="/payment"
                  className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  💳 Abonelik Satın Al
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Abonelik Bilgileri - Sadece Admin için */}
        {isAdmin && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
              <span>💎</span> Abonelik Bilgileri
            </h2>
            
            {isLoading ? (
              <p className="text-slate-400">Yükleniyor...</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">Abonelik Durumu</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    user.subscriptionStatus === "active" ? "text-emerald-400" : "text-amber-400"
                  }`}>
                    {user.subscriptionStatus === "active" ? "Aktif" : "Pasif"}
                  </p>
                </div>
                
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">Plan</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {subscription?.planName || "Ücretsiz"}
                  </p>
                </div>
                
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">Kalan Gün</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    (subscription?.daysRemaining || 0) > 7 ? "text-white" : "text-amber-400"
                  }`}>
                    {subscription?.daysRemaining || 0} gün
                  </p>
                </div>
                
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">Bitiş Tarihi</p>
                  <p className="mt-1 text-2xl font-bold text-white">
                    {subscription?.endDate 
                      ? subscription.endDate.toLocaleDateString("tr-TR")
                      : "-"
                    }
                  </p>
                </div>
              </div>
            )}

            {user.subscriptionStatus === "active" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowExtendModal(true)}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  ➕ Aboneliği Uzat
                </button>
                <Link
                  href="/payment?renew=true"
                  className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  🔄 Aboneliği Yenile
                </Link>
              </div>
            )}

            {user.subscriptionStatus !== "active" && (
              <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-200">
                  ⚠️ Aboneliğiniz aktif değil. İşletme özelliklerini kullanmak için abonelik satın alın.
                </p>
                <Link
                  href="/payment"
                  className="mt-3 inline-block rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Abonelik Satın Al →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* İstatistikler */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
            <span>📊</span> {isAdmin ? "İşletme İstatistikleri" : "Randevu İstatistikleri"}
          </h2>
          
          {isLoading ? (
            <p className="text-slate-400">Yükleniyor...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Toplam Randevu</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats.totalBookings}</p>
              </div>
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Tamamlanan</p>
                <p className="mt-1 text-3xl font-bold text-emerald-400">{stats.completedBookings}</p>
              </div>
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">Bekleyen</p>
                <p className="mt-1 text-3xl font-bold text-amber-400">{stats.pendingBookings}</p>
              </div>
              
              {isAdmin && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-slate-400">Toplam Gelir</p>
                  <p className="mt-1 text-3xl font-bold text-fuchsia-400">
                    ₺{stats.totalRevenue.toLocaleString("tr-TR")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* İşletmeler - Sadece Admin için */}
        {isAdmin && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <span>🏪</span> İşletmelerim
              </h2>
              {user.subscriptionStatus === "active" && (
                <Link
                  href="/dashboard/shop"
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  + Yeni İşletme Ekle
                </Link>
              )}
            </div>
            
            {isLoading ? (
              <p className="text-slate-400">Yükleniyor...</p>
            ) : shops.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center">
                <p className="text-slate-400">Henüz işletme eklenmemiş.</p>
                {user.subscriptionStatus === "active" ? (
                  <Link
                    href="/dashboard/shop"
                    className="mt-4 inline-block rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    İlk İşletmeni Ekle →
                  </Link>
                ) : (
                  <p className="mt-2 text-sm text-amber-400">
                    İşletme eklemek için abonelik satın alın.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {shops.map((shop) => (
                  <div
                    key={shop.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20"
                  >
                    <h3 className="text-lg font-semibold text-white">{shop.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">/{shop.slug}</p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/dashboard/shop`}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                      >
                        Düzenle
                      </Link>
                      <Link
                        href={`/s/${shop.slug}`}
                        target="_blank"
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                      >
                        Görüntüle →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hızlı Erişim Menüsü */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
            <span>🚀</span> Hızlı Erişim
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => router.push("/customer/bookings")}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-fuchsia-500/50 hover:bg-white/10 cursor-pointer"
            >
              <span className="text-3xl">📅</span>
              <div>
                <p className="font-semibold text-white">Randevularım</p>
                <p className="text-sm text-slate-400">Tüm randevularınızı görüntüleyin</p>
              </div>
            </button>
            
            <button
              onClick={() => router.push("/customer/settings")}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-fuchsia-500/50 hover:bg-white/10 cursor-pointer"
            >
              <span className="text-3xl">⚙️</span>
              <div>
                <p className="font-semibold text-white">Hesap Ayarları</p>
                <p className="text-sm text-slate-400">Profil ve şifre ayarları</p>
              </div>
            </button>
            
            {isAdmin && (
              <>
                <button
                  onClick={() => router.push("/dashboard/shop")}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-fuchsia-500/50 hover:bg-white/10 cursor-pointer"
                >
                  <span className="text-3xl">🏪</span>
                  <div>
                    <p className="font-semibold text-white">Mekan Yönetimi</p>
                    <p className="text-sm text-slate-400">İşletmenizi düzenleyin</p>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push("/dashboard/bookings")}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-fuchsia-500/50 hover:bg-white/10 cursor-pointer"
                >
                  <span className="text-3xl">📋</span>
                  <div>
                    <p className="font-semibold text-white">Randevu Yönetimi</p>
                    <p className="text-sm text-slate-400">Gelen randevuları yönetin</p>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push("/dashboard/revenue")}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-fuchsia-500/50 hover:bg-white/10 cursor-pointer"
                >
                  <span className="text-3xl">📈</span>
                  <div>
                    <p className="font-semibold text-white">Gelir & İstatistikler</p>
                    <p className="text-sm text-slate-400">Finansal raporlar</p>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push("/payment")}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-fuchsia-500/50 hover:bg-white/10 cursor-pointer"
                >
                  <span className="text-3xl">💳</span>
                  <div>
                    <p className="font-semibold text-white">Abonelik</p>
                    <p className="text-sm text-slate-400">Abonelik planınızı yönetin</p>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hesap Bilgileri */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-white">
            <span>👤</span> Hesap Bilgileri
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm text-slate-400">Kullanıcı ID</span>
              <span className="font-mono text-xs text-slate-300">{user.uid}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm text-slate-400">E-posta</span>
              <span className="text-sm text-white">{user.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm text-slate-400">Ad Soyad</span>
              <span className="text-sm text-white">{user.displayName || "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Hesap Tipi</span>
              <span className="text-sm font-medium text-white">
                {isAdmin ? "İşletme Sahibi" : "Müşteri"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Abonelik Uzatma Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Abonelik Süresi Seçin</h2>
              <button
                onClick={() => setShowExtendModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {subscriptionPlans.map((plan) => (
                <button
                  key={plan.months}
                  onClick={() => {
                    setShowExtendModal(false);
                    router.push(`/payment?extend=true&duration=${plan.months}`);
                  }}
                  className="rounded-xl border-2 border-white/10 bg-white/5 p-6 text-left transition hover:border-fuchsia-500/50 hover:bg-white/10"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-lg font-semibold text-white">{plan.label}</span>
                  </div>
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{plan.price.toFixed(2)} ₺</span>
                  </div>
                  {plan.months > 1 && (
                    <p className="text-sm text-slate-400">
                      Aylık: {(plan.price / plan.months).toFixed(2)} ₺
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

