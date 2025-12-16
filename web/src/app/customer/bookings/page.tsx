"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("[CustomerBookings] Render - user:", user?.uid, "loading:", loading, "initialized:", initialized);

  // Yönlendirme kontrolü - sadece initialized olduğunda
  useEffect(() => {
    console.log("[CustomerBookings] useEffect - initialized:", initialized, "user:", user?.uid, "role:", user?.role);
    if (!initialized) {
      console.log("[CustomerBookings] Not initialized yet, waiting...");
      return;
    }
    
    // Admin kullanıcıları dashboard'a yönlendir
    if (user?.role === "admin") {
      console.log("[CustomerBookings] Admin user, redirecting to dashboard");
      router.replace("/dashboard/bookings");
      return;
    }
    
    // User yoksa login'e yönlendir
    if (!user) {
      console.log("[CustomerBookings] No user, redirecting to login");
      router.replace("/auth/login");
      return;
    }
    
    console.log("[CustomerBookings] User exists, showing page");
  }, [initialized, user?.role, user, router]);

  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);
    // Real-time listener ekle - app'ten yapılan değişiklikler otomatik güncellenecek
    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          console.log('[Customer Bookings] Snapshot update:', {
            userUid: user.uid,
            totalDocs: snapshot.docs.length,
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
          setIsLoading(false);
        } catch (error) {
          console.error('[Customer Bookings] Snapshot error:', error);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('[Customer Bookings] Listener error:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
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

  // Loading durumunda veya henüz initialized olmadıysa bekle
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center backdrop-blur">
            <p className="text-slate-300">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin kullanıcılar için dashboard'a yönlendir (useEffect'te yapılıyor)
  if (user?.role === "admin") {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center backdrop-blur">
            <p className="text-slate-300">Yönlendiriliyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // User yoksa login'e yönlendir (useEffect'te yapılıyor)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center backdrop-blur">
            <p className="text-slate-300">Yönlendiriliyor...</p>
          </div>
        </div>
      </div>
    );
  }

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
