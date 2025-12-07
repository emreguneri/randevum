"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Booking {
  id: string;
  status: "pending" | "confirmed" | "cancelled";
  preferredDate: string;
  createdAt?: any;
  shopSlug?: string;
}

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  todayBookings: number;
  thisWeekBookings: number;
  thisMonthBookings: number;
  bookingsByStatus: {
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  recentBookings: Booking[];
}

export default function RevenueDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchBookings = useCallback(async () => {
    if (user?.role !== "admin") {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "bookings"));
      const items: Booking[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          status: (data.status as Booking["status"]) || "pending",
          preferredDate: data.preferredDate || "",
          createdAt: data.createdAt,
          shopSlug: data.shopSlug,
        };
      });
      const filtered = shopSlugs.length
        ? items.filter((item) => item.shopSlug && shopSlugs.includes(item.shopSlug))
        : items;
      setBookings(filtered);
    } catch (error) {
      console.error("[RevenueDashboard] fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [user?.role, shopSlugs]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchBookings();
    }
  }, [fetchBookings, user?.role]);

  const stats: Stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    const todayBookings = bookings.filter((b) => {
      if (!b.createdAt) return false;
      const created = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return created >= today;
    }).length;

    const thisWeekBookings = bookings.filter((b) => {
      if (!b.createdAt) return false;
      const created = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return created >= weekAgo;
    }).length;

    const thisMonthBookings = bookings.filter((b) => {
      if (!b.createdAt) return false;
      const created = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return created >= monthAgo;
    }).length;

    const recentBookings = [...bookings]
      .sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 10);

    return {
      totalBookings: bookings.length,
      confirmedBookings: confirmed,
      pendingBookings: pending,
      cancelledBookings: cancelled,
      todayBookings,
      thisWeekBookings,
      thisMonthBookings,
      bookingsByStatus: {
        confirmed,
        pending,
        cancelled,
      },
      recentBookings,
    };
  }, [bookings]);

  const confirmationRate = stats.totalBookings > 0 
    ? ((stats.confirmedBookings / stats.totalBookings) * 100).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Gelir & İstatistikler</h1>
            <p className="mt-2 text-sm text-slate-200/70">
              İşletmenizin randevu istatistiklerini ve performans metriklerini görüntüleyin.
            </p>
          </div>
          <button
            onClick={fetchBookings}
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/60"
          >
            Yenile
          </button>
        </header>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center text-slate-300">
            İstatistikler yükleniyor...
          </div>
        ) : (
          <>
            {/* Özet Kartlar */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300/70">Toplam Randevu</p>
                    <p className="mt-2 text-3xl font-bold text-white">{stats.totalBookings}</p>
                  </div>
                  <div className="rounded-full bg-blue-500/20 p-3">
                    <span className="text-2xl">📅</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300/70">Onaylanan</p>
                    <p className="mt-2 text-3xl font-bold text-white">{stats.confirmedBookings}</p>
                  </div>
                  <div className="rounded-full bg-emerald-500/20 p-3">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300/70">Beklemede</p>
                    <p className="mt-2 text-3xl font-bold text-white">{stats.pendingBookings}</p>
                  </div>
                  <div className="rounded-full bg-amber-500/20 p-3">
                    <span className="text-2xl">⏳</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/10 to-slate-900/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300/70">İptal Edilen</p>
                    <p className="mt-2 text-3xl font-bold text-white">{stats.cancelledBookings}</p>
                  </div>
                  <div className="rounded-full bg-rose-500/20 p-3">
                    <span className="text-2xl">❌</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zaman Bazlı İstatistikler */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-300/70">Bugün</p>
                <p className="mt-2 text-2xl font-bold text-white">{stats.todayBookings}</p>
                <p className="mt-1 text-xs text-slate-400">Yeni randevu talepleri</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-300/70">Bu Hafta</p>
                <p className="mt-2 text-2xl font-bold text-white">{stats.thisWeekBookings}</p>
                <p className="mt-1 text-xs text-slate-400">Son 7 gün</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-sm text-slate-300/70">Bu Ay</p>
                <p className="mt-2 text-2xl font-bold text-white">{stats.thisMonthBookings}</p>
                <p className="mt-1 text-xs text-slate-400">Son 30 gün</p>
              </div>
            </div>

            {/* Onay Oranı ve Durum Dağılımı */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="mb-4 text-lg font-semibold text-white">Onay Oranı</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 overflow-hidden rounded-full bg-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                        style={{ width: `${confirmationRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">{confirmationRate}%</p>
                    <p className="text-xs text-slate-400">
                      {stats.confirmedBookings} / {stats.totalBookings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="mb-4 text-lg font-semibold text-white">Durum Dağılımı</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-300">Onaylanan</span>
                    </div>
                    <span className="font-semibold text-white">{stats.confirmedBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <span className="text-sm text-slate-300">Beklemede</span>
                    </div>
                    <span className="font-semibold text-white">{stats.pendingBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <span className="text-sm text-slate-300">İptal Edilen</span>
                    </div>
                    <span className="font-semibold text-white">{stats.cancelledBookings}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Son Randevular */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="mb-4 text-lg font-semibold text-white">Son Randevular</h3>
              {stats.recentBookings.length === 0 ? (
                <p className="py-8 text-center text-slate-400">Henüz randevu bulunmuyor.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Tarih
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Durum
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.recentBookings.map((booking) => {
                        const date = booking.createdAt?.toDate
                          ? booking.createdAt.toDate()
                          : new Date(booking.createdAt || 0);
                        return (
                          <tr key={booking.id} className="hover:bg-white/5">
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-200">
                              {new Intl.DateTimeFormat("tr-TR", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(date)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                                  booking.status === "confirmed"
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : booking.status === "cancelled"
                                    ? "bg-amber-900/20 text-amber-300"
                                    : "bg-amber-500/10 text-amber-300"
                                }`}
                              >
                                {booking.status === "confirmed"
                                  ? "Onaylandı"
                                  : booking.status === "cancelled"
                                  ? "İptal Edildi"
                                  : "Beklemede"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

