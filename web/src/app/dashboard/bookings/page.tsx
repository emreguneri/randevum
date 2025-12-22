"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  branch: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt?: string;
  shopName?: string;
  shopSlug?: string;
  customerEmail?: string | null;
}

const statusLabels: Record<Booking["status"], string> = {
  pending: "Beklemede",
  confirmed: "Onaylandı",
  cancelled: "İptal Edildi",
};

export default function BookingsDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [shopSlugs, setShopSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.replace("/auth/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const loadShops = async () => {
      if (!user?.uid) return;
      const snapshot = await getDocs(query(collection(db, "shops"), where("ownerId", "==", user.uid)));
      const slugs = snapshot.docs.map((docSnap) => (docSnap.data().slug as string) || docSnap.id);
      setShopSlugs(slugs);
    };
    if (user?.role === "admin") {
      loadShops();
    }
  }, [user?.uid, user?.role]);

  useEffect(() => {
    if (user?.role !== "admin" || !user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const bookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    
    // Real-time listener ekle - app'ten yapılan değişiklikler otomatik güncellenecek
    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        try {
          const items: Booking[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name || "-",
              phone: data.phone || "-",
              service: data.service || "-",
              branch: data.branch || "-",
              preferredDate: data.preferredDate || "-",
              preferredTime: data.preferredTime || "-",
              notes: data.notes || "",
              status: (data.status as Booking["status"]) || "pending",
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
              shopName: data.shopName || "-",
              shopSlug: data.shopSlug,
              customerEmail: data.customerEmail || null,
            };
          });
          const filtered = shopSlugs.length
            ? items.filter((item) => item.shopSlug && shopSlugs.includes(item.shopSlug))
            : items;
          setBookings(filtered);
          setLoading(false);
        } catch (error) {
          console.error("[BookingsDashboard] snapshot error", error);
          setFeedback({
            type: "error",
            message: "Randevular yüklenirken bir sorun oluştu.",
          });
          setLoading(false);
        }
      },
      (error) => {
        console.error("[BookingsDashboard] listener error", error);
        setFeedback({
          type: "error",
          message: "Randevular yüklenirken bir sorun oluştu.",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.role, user?.uid, shopSlugs]);

  const formattedBookings = useMemo(() => {
    return bookings.map((booking) => {
      const createdFormatted = booking.createdAt
        ? new Intl.DateTimeFormat("tr-TR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(booking.createdAt))
        : "-";

      const preferredFormatted = booking.preferredDate
        ? `${booking.preferredDate} ${booking.preferredTime || ""}`.trim()
        : "-";

      return {
        ...booking,
        createdFormatted,
        preferredFormatted,
      };
    });
  }, [bookings]);

  const updateStatus = async (id: string, status: Booking["status"]) => {
    try {
      setUpdatingId(id);
      await updateDoc(doc(db, "bookings", id), { status });
      setFeedback({ type: "success", message: "Randevu durumu güncellendi." });
      setBookings((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } catch (error) {
      console.error("[BookingsDashboard] update error", error);
      setFeedback({ type: "error", message: "Durum güncellenirken bir hata oluştu." });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Randevu Talepleri</h1>
            <p className="mt-2 text-sm text-slate-200/70">
              Web formundan gelen tüm talepleri buradan görüntüleyebilir, onaylayabilir veya iptal edebilirsiniz.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/60"
          >
            Sayfayı Yenile
          </button>
        </header>

        {feedback && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-amber-700/40 bg-amber-900/20 text-amber-200"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {shopSlugs.length === 0 && (
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 px-6 py-4 text-sm text-amber-200">
            Henüz işletme bilgilerinizi tamamlamadınız. Rezervasyon linkinizi oluşturmak için{" "}
            <Link href="/dashboard/shop" className="underline">
              işletme ayarları
            </Link>{" "}
            sayfasını ziyaret edin.
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-3">Randevu Sahibi</th>
                <th className="px-6 py-3">İletişim</th>
                <th className="px-6 py-3">Hizmet & Şube</th>
                <th className="px-6 py-3">Tercih Edilen Zaman</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3">Not</th>
                <th className="px-6 py-3">Oluşturulma</th>
                <th className="px-6 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-300" colSpan={8}>
                    Randevular yükleniyor...
                  </td>
                </tr>
              ) : formattedBookings.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-300" colSpan={8}>
                    Henüz bir randevu talebi bulunmuyor.
                  </td>
                </tr>
              ) : (
                formattedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-white">{booking.name}</td>
                    <td className="px-6 py-4 text-slate-200/80">
                      <p>{booking.phone}</p>
                      {booking.customerEmail && (
                        <p className="text-xs text-slate-200/60">{booking.customerEmail}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-200/80">
                      <p className="font-medium text-white">{booking.service}</p>
                      <p className="text-xs text-slate-200/60">{booking.branch}</p>
                      {booking.shopName && (
                        <p className="text-xs text-slate-200/60">
                          İşletme:{" "}
                          {booking.shopSlug ? (
                            <a
                              href={`/book/${booking.shopSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {booking.shopName}
                            </a>
                          ) : (
                            booking.shopName
                          )}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-200/80">{booking.preferredFormatted}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          booking.status === "confirmed"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : booking.status === "cancelled"
                            ? "bg-amber-900/20 text-amber-300"
                            : "bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-slate-200/70">
                      {booking.notes ? booking.notes : <span className="text-slate-400/60">-</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-200/60">{booking.createdFormatted}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          disabled={updatingId === booking.id || booking.status === "confirmed"}
                          className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          disabled={updatingId === booking.id || booking.status === "cancelled"}
                          className="rounded-full bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-200 transition hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          İptal Et
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
