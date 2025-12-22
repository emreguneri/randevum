"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const MONTHLY_FEE = 99.99;

// Süre bazlı fiyatlandırma (indirimli)
const getPriceForDuration = (months: number): number => {
  const basePrice = MONTHLY_FEE * months;
  if (months >= 12) return basePrice * 0.8; // 20% indirim
  if (months >= 6) return basePrice * 0.85; // 15% indirim
  if (months >= 3) return basePrice * 0.9; // 10% indirim
  return basePrice;
};

export default function PaymentPage() {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExtend = searchParams.get("extend") === "true";
  const durationMonths = searchParams.get("duration") ? parseInt(searchParams.get("duration") as string, 10) : 1;
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSubscriptionEnd, setCurrentSubscriptionEnd] = useState<Date | null>(null);
  
  const selectedPrice = isExtend ? getPriceForDuration(durationMonths) : MONTHLY_FEE;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
      return;
    }
    if (user) {
      setContactName(user.displayName || user.email?.split("@")[0] || "");
      
      // Eğer extend modundaysa, mevcut abonelik bitiş tarihini yükle
      if (isExtend && user.uid) {
        const loadCurrentSubscription = async () => {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              if (userData.subscriptionEndsAt) {
                const endDate = userData.subscriptionEndsAt?.toDate 
                  ? userData.subscriptionEndsAt.toDate() 
                  : new Date(userData.subscriptionEndsAt);
                setCurrentSubscriptionEnd(endDate);
              }
            }
          } catch (error) {
            console.error("[Payment] Error loading current subscription:", error);
          }
        };
        loadCurrentSubscription();
      }
    }
  }, [authLoading, user, router, isExtend]);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(" ").substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasyon
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanedCardNumber.length !== 16) {
      setError("Kart numarası 16 haneli olmalıdır.");
      return;
    }

    if (expiryDate.length !== 5) {
      setError("Son kullanma tarihi geçerli değil.");
      return;
    }

    if (cvv.length !== 3) {
      setError("CVV 3 haneli olmalıdır.");
      return;
    }

    if (!contactName.trim()) {
      setError("Lütfen ad soyad giriniz.");
      return;
    }

    const cleanedPhone = contactPhone.replace(/[^\d]/g, "");
    if (cleanedPhone.length < 10) {
      setError("Lütfen geçerli bir telefon numarası giriniz (05xx ...).");
      return;
    }

    const [expMonth, expYearRaw] = expiryDate.split("/");
    const expireMonth = expMonth;
    const expireYear = expYearRaw?.length === 2 ? `20${expYearRaw}` : expYearRaw;

    const nameParts = contactName.trim().split(" ");
    const surname = nameParts.length > 1 ? nameParts.pop() || "Sahibi" : "Sahibi";
    const firstName = nameParts.join(" ") || contactName.trim() || "İşletme";

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/payments/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: firstName,
            surname,
            email: user?.email || "",
            phone: cleanedPhone,
            identityNumber: identityNumber || "11111111111",
          },
          card: {
            cardHolderName: cardHolder,
            cardNumber: cleanedCardNumber,
            expireMonth,
            expireYear,
            cvc: cvv,
          },
          address: {
            city: "İstanbul",
            country: "Turkey",
            line: "Randevum İşletme Adresi",
            zipCode: "34000",
          },
        }),
      });

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(data?.message || "Ödeme işlemi tamamlanamadı.");
      }

      const subscriptionData = data.data;
      
      // Abonelik bitiş tarihini hesapla
      let subscriptionEndDate: Date;
      if (isExtend && currentSubscriptionEnd) {
        // Mevcut aboneliği uzat
        subscriptionEndDate = new Date(currentSubscriptionEnd);
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + durationMonths);
      } else {
        // Yeni abonelik veya uzatma (mevcut tarih yoksa)
        subscriptionEndDate = new Date();
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + (isExtend ? durationMonths : 1));
      }

      if (user?.uid) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            role: "admin",
            subscriptionStatus: "active",
            subscriptionPlan: isExtend ? `business-${durationMonths}month` : "business-monthly",
            subscriptionProvider: "iyzico",
            subscriptionEndsAt: subscriptionEndDate.toISOString(),
            subscriptionStartedAt: serverTimestamp(),
            iyzico: {
              customerReferenceCode: subscriptionData.customerReferenceCode,
              subscriptionReferenceCode: subscriptionData.subscriptionReferenceCode,
              pricingPlanReferenceCode: subscriptionData.pricingPlanReferenceCode,
            },
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // Profil bilgilerini yenile
      await refreshProfile();

      // Başarılı mesajı göster ve yönlendir
      if (isExtend) {
        alert(`Ödeme Başarılı! Aboneliğiniz ${durationMonths} ${durationMonths === 1 ? "ay" : "ay"} uzatıldı.`);
        router.push("/profile");
      } else {
        alert("Ödeme Başarılı! İşletme sahibi hesabınız aktif edildi. Artık mekanınızı ekleyebilirsiniz.");
        router.push("/dashboard/shop");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err?.message || "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              {isExtend ? "Aboneliği Uzat" : "İşletme Sahibi Ödeme"}
            </h1>
            <p className="mt-2 text-slate-300">
              {isExtend ? (
                <>
                  {durationMonths} {durationMonths === 1 ? "Ay" : "Ay"} abonelik ücreti:{" "}
                  <span className="font-semibold text-white">{selectedPrice.toFixed(2)} ₺</span>
                  {durationMonths > 1 && (
                    <span className="ml-2 text-emerald-400">
                      ({durationMonths >= 12 ? "20%" : durationMonths >= 6 ? "15%" : "10%"} İndirim)
                    </span>
                  )}
                </>
              ) : (
                <>
                  Aylık abonelik ücreti: <span className="font-semibold text-white">{MONTHLY_FEE} ₺</span>
                </>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* İletişim Bilgileri */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">İletişim Bilgileri</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300">Ad Soyad</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  placeholder="Ad Soyad"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Telefon</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  placeholder="05xx xxx xx xx"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">TC Kimlik No (Opsiyonel)</label>
                <input
                  type="text"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  placeholder="11111111111"
                  maxLength={11}
                />
              </div>
            </div>

            {/* Kart Bilgileri */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Kart Bilgileri</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300">Kart Numarası</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  placeholder="5528 7900 0000 0008"
                  maxLength={19}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Kart Sahibi</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  placeholder="TEST USER"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">Son Kullanma</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    placeholder="12/30"
                    maxLength={5}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300">CVV</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                    className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-slate-400 focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-amber-900/30 border border-amber-800/50 p-4 text-amber-200">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-gradient-to-r from-amber-900 to-slate-900 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-900/50 transition hover:from-amber-950 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "İşleniyor..." : `${MONTHLY_FEE} ₺ Öde`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

