"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Booking {
  id: string;
  service: string;
  branch: string;
  preferredDate: string;
  preferredTime: string;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
  createdAt?: string;
  shopName?: string;
  shopSlug?: string;
}

const statusLabels: Record<Booking["status"], string> = {
  pending: "Beklemede",
  confirmed: "Onaylandı",
  cancelled: "İptal Edildi",
};

export default function CustomerBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else if (user.role !== "customer") {
        router.replace(user.role === "admin" ? "/dashboard/bookings" : "/");
      }
    }
  }, [loading, user, router]);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.uid) return;
      try {
        setIsLoading(true);
        // Önce orderBy olmadan sorgu yap (index gerekebilir)
        const q = query(
          collection(db, "bookings"),
          where("customerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        console.log('[Customer Bookings] Query result:', {
          userUid: user.uid,
          totalDocs: snapshot.docs.length,
          docs: snapshot.docs.map(d => ({ id: d.id, data: d.data() }))
        });
        const items: Booking[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            service: data.service || "-",
            branch: data.branch || "-",
            preferredDate: data.preferredDate || "-",
            preferredTime: data.preferredTime || "-",
            status: (data.status as Booking["status"]) || "pending",
            notes: data.notes,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
            shopName: data.shopName,
            shopSlug: data.shopSlug,
          };
        });
        // Manuel olarak tarihe göre sırala (orderBy index gerekebilir)
        items.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // En yeni önce
        });
        setBookings(items);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.uid) {
      loadBookings();
    }
  }, [user?.uid]);

  const formattedBookings = useMemo(() => {
    return bookings.map((booking) => {
      const formattedCreated = booking.createdAt
        ? new Intl.DateTimeFormat("tr-TR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(booking.createdAt))
        : "-";

      return {
        ...booking,
        formattedCreated,
        preferredFormatted: booking.preferredDate
          ? `${booking.preferredDate} ${booking.preferredTime || ""}`.trim()
          : "-",
      };
    });
  }, [bookings]);

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="space-y-2 rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur">
          <h1 className="text-3xl font-semibold text-white">Randevularım</h1>
          <p className="text-sm text-slate-200/70">
            Onay bekleyen, onaylanan veya iptal edilen randevularınızı buradan takip edebilirsiniz.
          </p>
        </header>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-6 py-3">Hizmet</th>
                <th className="px-6 py-3">Şube</th>
                <th className="px-6 py-3">Tarih & Saat</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3">Not</th>
                <th className="px-6 py-3">Oluşturulma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-300" colSpan={6}>
                    Randevularınız yükleniyor...
                  </td>
                </tr>
              ) : formattedBookings.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-center text-slate-300" colSpan={6}>
                    Henüz bir randevu talebiniz bulunmuyor.
                  </td>
                </tr>
              ) : (
                formattedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 text-white">{booking.service}</td>
                    <td className="px-6 py-4 text-slate-200/80">
                      {booking.branch}
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
                    <td className="px-6 py-4 text-slate-200/70">
                      {booking.notes ? booking.notes : <span className="text-slate-400/60">-</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-200/60">{booking.formattedCreated}</td>
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
