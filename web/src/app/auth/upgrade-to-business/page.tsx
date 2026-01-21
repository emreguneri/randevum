"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UpgradeToBusinessPage() {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [showPlanModal, setShowPlanModal] = useState(false);

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
    // Zaten admin ise profile'a yönlendir
    if (initialized && user?.role === "admin") {
      router.replace("/profile");
    }
  }, [initialized, user, router]);

  const handleUpgrade = () => {
    setShowPlanModal(true);
  };

  const handleSelectPlan = (months: number) => {
    setShowPlanModal(false);
    router.push(`/payment?upgrade=true&duration=${months}`);
  };

  // Loading durumunda bekle
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center py-20">
          <p className="text-slate-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // User yoksa yönlendirme yapılacak
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center py-20">
          <p className="text-slate-300">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // Zaten admin ise
  if (user.role === "admin") {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center py-20">
          <p className="text-slate-300">Zaten işletme sahibisiniz. Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-4xl">
            🏪
          </div>
          <h1 className="text-3xl font-bold text-white">İşletme Sahibi Ol</h1>
          <p className="mt-2 text-slate-400">
            İşletmenizi Randevum'a ekleyin ve müşterilerinize ulaşın
          </p>
        </div>

        {/* Benefits */}
        {(
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="mb-6 text-xl font-semibold text-white">
              İşletme Sahibi Olarak Neler Yapabilirsiniz?
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-medium text-white">Online Randevu Sistemi</p>
                  <p className="text-sm text-slate-400">Müşterileriniz 7/24 online randevu alabilir</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="font-medium text-white">Personel Yönetimi</p>
                  <p className="text-sm text-slate-400">Çalışanlarınızı ve programlarını yönetin</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-white">Detaylı Raporlar</p>
                  <p className="text-sm text-slate-400">Gelir ve randevu istatistiklerini takip edin</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-medium text-white">Mobil Uygulama</p>
                  <p className="text-sm text-slate-400">İşletmenizi mobil uygulamada da yönetin</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-medium text-white">Bildirimler</p>
                  <p className="text-sm text-slate-400">Yeni randevulardan anında haberdar olun</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Info */}
        {(
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-8 backdrop-blur">
            <div className="text-center">
              <p className="text-sm text-purple-300">Aylık abonelik ücreti</p>
              <p className="mt-1 text-3xl font-bold text-white">
                800 ₺
              </p>
              <p className="mt-2 text-sm text-slate-400">
                3 ay, 6 ay ve 1 yıllık paketlerde indirim fırsatları
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleUpgrade}
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90"
          >
            🚀 Abonelik Satın Al ve İşletme Sahibi Ol
          </button>
            
          <Link
            href="/profile"
            className="block w-full rounded-xl border border-white/20 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-white/10"
          >
            ← Geri Dön
          </Link>
        </div>

        {/* Terms */}
        {(
          <p className="text-center text-xs text-slate-500">
            İşletme sahibi olarak{" "}
            <Link href="/terms" className="text-fuchsia-400 hover:underline">
              Kullanım Şartları
            </Link>{" "}
            ve{" "}
            <Link href="/privacy" className="text-fuchsia-400 hover:underline">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
        )}

      {/* Abonelik Planı Seçim Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Abonelik Süresi Seçin</h2>
              <button
                onClick={() => setShowPlanModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {subscriptionPlans.map((plan) => (
                <button
                  key={plan.months}
                  onClick={() => handleSelectPlan(plan.months)}
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
    </div>
  );
}

