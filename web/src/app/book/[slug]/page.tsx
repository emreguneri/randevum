"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface ServiceOption {
  name: string;
  duration: number;
  price: number;
}

interface ShopData {
  name: string;
  slug: string;
  address?: string;
  description?: string;
  services: ServiceOption[];
  workingHours?: {
    start: string;
    end: string;
  };
  timezone?: string;
  workingDays?: number[];
  logo?: string;
  photos?: string[];
  phone?: string;
  rating?: number;
  totalRatings?: number;
  ownerId?: string;
  ownerPhone?: string;
  ownerPhoneNumber?: string;
  instagramUrl?: string;
  staff?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface BookingSlot {
  time: string;
  available: boolean;
}

const STEP_MINUTES = 30;

function getNextAvailableDate(startDate: Date, allowedDays?: number[]): string {
  if (!allowedDays || allowedDays.length === 0) {
    return startDate.toISOString().split("T")[0];
  }
  const candidate = new Date(startDate);
  for (let i = 0; i < 14; i++) {
    if (allowedDays.includes(candidate.getDay())) {
      break;
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.toISOString().split("T")[0];
}

function generateSlots(start: string, end: string): string[] {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const slots: string[] = [];
  let current = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  while (current < endMinutes) {
    const hours = Math.floor(current / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (current % 60).toString().padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    current += STEP_MINUTES;
  }
  return slots;
}

export default function BookShopPage() {
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [isFromWhatsApp, setIsFromWhatsApp] = useState(false);
  const [activeTab, setActiveTab] = useState<'booking' | 'reviews' | 'pricing' | 'address'>('booking');
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);

  useEffect(() => {
    const loadShop = async () => {
      if (!params?.slug) return;
      setLoading(true);
      try {
        // URL'den gelen slug'ı decode et ve lowercase'e çevir
        const decodedSlug = decodeURIComponent(params.slug).toLowerCase().trim();
        const shopDoc = await getDoc(doc(db, "shops", decodedSlug));
        if (shopDoc.exists()) {
          const data = shopDoc.data() as ShopData;
          setShop({ 
            ...data, 
            slug: decodedSlug,
            location: data.location || undefined, // Location field'ını da yükle
          } as ShopData);
          if (data.services?.length) {
            setService(data.services[0].name);
          }
          const today = new Date();
          setDate(getNextAvailableDate(today, data.workingDays));
        } else {
          // Slug eşleşmedi, alternatif olarak slug field'ına göre sorgula
          const shopsQuery = query(
            collection(db, "shops"),
            where("slug", "==", decodedSlug)
          );
          const snapshot = await getDocs(shopsQuery);
          if (!snapshot.empty) {
            const shopData = snapshot.docs[0].data() as ShopData;
            setShop({ 
              ...shopData, 
              slug: decodedSlug,
              location: shopData.location || undefined, // Location field'ını da yükle
            } as ShopData);
            if (shopData.services?.length) {
              setService(shopData.services[0].name);
            }
            const today = new Date();
            setDate(getNextAvailableDate(today, shopData.workingDays));
          } else {
            setShop(null);
          }
        }
      } catch (error) {
        console.error("[BookShop] Error loading shop:", error);
        setShop(null);
      } finally {
        setLoading(false);
      }
    };
    loadShop();
  }, [params?.slug]);

  // Load Google Maps
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      setMapLoaded(true);
    } else {
      // Google Maps script yüklenene kadar bekle
      const checkGoogleMaps = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).google) {
          setMapLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 100);
      return () => clearInterval(checkGoogleMaps);
    }
  }, []);

  // Get coordinates - only use shop.location (geocoding disabled due to API restrictions)
  const getCoordinates = (): { lat: number; lng: number } | null => {
    // Only use shop.location if available (geocoding is disabled)
    if (shop?.location?.latitude && shop?.location?.longitude) {
      return {
        lat: shop.location.latitude,
        lng: shop.location.longitude,
      };
    }

    // Geocoding is disabled - return null
    return null;
  };

  // Open Google Maps
  const openInGoogleMaps = () => {
    if (!shop?.address) return;
    const encodedAddress = encodeURIComponent(shop.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  // Get directions
  const getDirections = () => {
    if (!shop?.address) return;
    const encodedAddress = encodeURIComponent(shop.address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  // Initialize map for address tab
  useEffect(() => {
    if (activeTab !== 'address') {
      setMapError(null);
      setMapLoading(false);
      return;
    }
    
    // Only show map if location field exists
    if (!shop?.location?.latitude || !shop?.location?.longitude) {
      setMapError(null);
      setMapLoading(false);
      return;
    }
    
    const initMap = () => {
      setMapLoading(true);
      setMapError(null);

      // Wait for Google Maps to load if needed
      if (!mapLoaded || !(window as any).google) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
          attempts++;
          if ((window as any).google) {
            setMapLoaded(true);
            clearInterval(checkInterval);
          } else if (attempts > 50) {
            // 5 seconds timeout
            clearInterval(checkInterval);
            setMapError("Google Maps yüklenemedi. Lütfen sayfayı yenileyin.");
            setMapLoading(false);
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }

      try {
        const coords = getCoordinates();
        if (!coords) {
          setMapLoading(false);
          return;
        }

        const mapElement = document.getElementById('map');
        if (!mapElement) {
          setMapLoading(false);
          return;
        }

        const map = new (window as any).google.maps.Map(mapElement, {
          center: coords,
          zoom: 15,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#1a0a0a" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#ffffff" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#000000" }]
            }
          ]
        });

        new (window as any).google.maps.Marker({
          position: coords,
          map: map,
          title: shop.name,
        });

        setMapError(null);
        setMapLoading(false);
      } catch (error) {
        console.error("[Map] Error initializing map:", error);
        setMapError("Harita yüklenirken bir hata oluştu. 'Haritada Gör' butonunu kullanabilirsiniz.");
        setMapLoading(false);
      }
    };

    initMap();
  }, [mapLoaded, shop?.location, activeTab]);

  // Initialize map for booking tab (left column) - only if location exists
  useEffect(() => {
    if (activeTab !== 'booking') return;
    if (!shop?.location?.latitude || !shop?.location?.longitude) return;
    
    const initBookingMap = () => {
      // Wait for Google Maps to load if needed
      if (!mapLoaded || !(window as any).google) {
        const checkInterval = setInterval(() => {
          if ((window as any).google) {
            setMapLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
        return () => clearInterval(checkInterval);
      }

      try {
        const coords = getCoordinates();
        if (!coords) {
          return;
        }

        const mapElement = document.getElementById('map-booking');
        if (!mapElement) return;

        const map = new (window as any).google.maps.Map(mapElement, {
          center: coords,
          zoom: 15,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#1a0a0a" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#ffffff" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#000000" }]
            }
          ]
        });

        new (window as any).google.maps.Marker({
          position: coords,
          map: map,
          title: shop.name,
        });
      } catch (error) {
        console.error("[Map] Error initializing booking map:", error);
      }
    };

    initBookingMap();
  }, [mapLoaded, shop?.location, activeTab]);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      if (!shop?.slug) return;
      try {
        setLoadingReviews(true);
        const reviewsQuery = query(
          collection(db, "reviews"),
          where("shopId", "==", shop.slug),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(reviewsQuery);
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsData);
        
        // Calculate average rating
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum, r: any) => sum + (r.rating || 0), 0);
          const avg = total / reviewsData.length;
          setAverageRating(avg);
          setTotalReviews(reviewsData.length);
        } else {
          setAverageRating(shop.rating || 0);
          setTotalReviews(shop.totalRatings || 0);
        }
      } catch (error) {
        console.error("[BookShop] Error loading reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };
    if (activeTab === 'reviews' || shop) {
      loadReviews();
    }
  }, [shop?.slug, activeTab]);

  // Submit review
  const handleSubmitReview = async () => {
    if (!user) {
      setFeedback("Yorum yazmak için giriş yapmanız gerekiyor.");
      return;
    }
    if (!reviewComment.trim()) {
      setFeedback("Lütfen yorumunuzu yazın.");
      return;
    }
    try {
      setSubmittingReview(true);
      setFeedback(null);
      
      const reviewData = {
        shopId: shop?.slug,
        shopName: shop?.name,
        ownerId: shop?.ownerId || null,
        customerId: user.uid,
        customerName: user.displayName || user.email?.split('@')[0] || 'Anonim',
        customerEmail: user.email,
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, "reviews"), reviewData);
      
      // Update shop rating
      const newReviews = [...reviews, { ...reviewData, id: 'temp' }];
      const newTotal = newReviews.length;
      const newAvg = newReviews.reduce((sum, r: any) => sum + (r.rating || 0), 0) / newTotal;
      
      // Update shop document
      if (shop?.slug) {
        await updateDoc(doc(db, "shops", shop.slug), {
          rating: newAvg,
          totalRatings: newTotal,
        });
      }
      
      setReviews(newReviews);
      setAverageRating(newAvg);
      setTotalReviews(newTotal);
      setReviewComment("");
      setReviewRating(5);
      setFeedback("Yorumunuz başarıyla eklendi. Teşekkür ederiz!");
    } catch (error) {
      console.error("[BookShop] Error submitting review:", error);
      setFeedback("Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // WhatsApp'tan açıldığını algıla
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isWhatsApp = userAgent.includes("whatsapp");
      setIsFromWhatsApp(isWhatsApp);
    }
  }, []);

  useEffect(() => {
    const loadTakenSlots = async () => {
      if (!date || !shop?.slug) {
        setTakenSlots([]);
        return;
      }
      try {
        // orderBy kaldırıldı - client-side'da sıralayacağız (index gereksinimini ortadan kaldırır)
        const q = query(
          collection(db, "bookings"),
          where("shopSlug", "==", shop.slug),
          where("preferredDate", "==", date)
        );
        const snapshot = await getDocs(q);
        const used = snapshot.docs
          .map((docSnap) => docSnap.data())
          .filter((data) => data.status !== "cancelled")
          .map((data) => data.preferredTime as string)
          .sort((a, b) => a.localeCompare(b)); // Client-side sıralama
        setTakenSlots(used);
      } catch (error) {
        console.error("[BookShop] Error loading taken slots:", error);
        setTakenSlots([]);
      }
    };
    if (shop?.slug && date) {
      loadTakenSlots();
    }
  }, [shop?.slug, date]);

  const availableSlots: BookingSlot[] = useMemo(() => {
    if (!shop?.workingHours || !date) return [];
    if (shop.workingDays?.length) {
      const selectedDay = new Date(date).getDay();
      if (!shop.workingDays.includes(selectedDay)) {
        return [];
      }
    }
    return generateSlots(shop.workingHours.start, shop.workingHours.end).map((slot) => ({
      time: slot,
      available: !takenSlots.includes(slot),
    }));
  }, [shop?.workingHours, shop?.workingDays, date, takenSlots]);

  useEffect(() => {
    if (time && takenSlots.includes(time)) {
      setTime("");
    }
  }, [takenSlots, time]);

  useEffect(() => {
    if (!shop?.workingDays?.length || !date) return;
    const selectedDay = new Date(date).getDay();
    if (!shop.workingDays.includes(selectedDay)) {
      const nextDate = getNextAvailableDate(new Date(date), shop.workingDays);
      setDate(nextDate);
    }
  }, [date, shop?.workingDays]);

  const isClosedDay = useMemo(() => {
    if (!shop?.workingDays?.length || !date) return false;
    const selectedDay = new Date(date).getDay();
    return !shop.workingDays.includes(selectedDay);
  }, [date, shop?.workingDays]);

  /**
   * İşletme sahibinin telefon numarasını Firestore'dan çeker
   * Not: users koleksiyonundan okuma yapmıyoruz çünkü permission hatası alıyoruz
   * Telefon numarası shops koleksiyonunda olmalı
   */
  const getBusinessOwnerPhone = async (shopSlug: string): Promise<string | null> => {
    try {
      const normalizedSlug = shopSlug.toLowerCase().trim();
      let shopDoc = await getDoc(doc(db, "shops", normalizedSlug));
      
      // Eğer doküman ID ile bulunamazsa, slug field'ına göre sorgula
      if (!shopDoc.exists()) {
        const shopsQuery = query(
          collection(db, "shops"),
          where("slug", "==", normalizedSlug)
        );
        const snapshot = await getDocs(shopsQuery);
        if (!snapshot.empty) {
          shopDoc = snapshot.docs[0] as any;
        }
      }
      
      if (shopDoc.exists()) {
        const shopData = shopDoc.data();
        // Sadece shops koleksiyonundan telefon numarasını al
        // users koleksiyonundan okuma yapmıyoruz (permission hatası alıyoruz)
        return shopData.ownerPhone || shopData.phone || shopData.ownerPhoneNumber || null;
      }
      return null;
    } catch (error) {
      console.error("[BookShopPage] İşletme sahibi telefon numarası alınamadı:", error);
      return null;
    }
  };

  /**
   * Randevu oluşturulduğunda SMS gönderir
   */
  const sendAppointmentSMS = async (bookingData: any, shopData: ShopData) => {
    try {
      // İşletme sahibinin telefon numarasını al
      const businessOwnerPhone = await getBusinessOwnerPhone(shopData.slug);
      
      if (!businessOwnerPhone && !bookingData.phone) {
        console.log("[SMS] Telefon numarası bulunamadı, SMS gönderilmiyor");
        return;
      }

      const appointmentData = {
        shopName: shopData.name,
        service: bookingData.service,
        preferredDate: bookingData.preferredDate,
        preferredTime: bookingData.preferredTime,
        customerName: bookingData.name,
        customerPhone: bookingData.phone,
      };

      const response = await fetch(`${BACKEND_API_URL}/api/sms/appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentData,
          businessOwnerPhone,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "success") {
          console.log("[SMS] ✅ SMS başarıyla gönderildi");
        } else {
          console.warn("[SMS] ⚠️ SMS gönderimi kısmen başarılı:", result);
        }
      } else {
        console.error("[SMS] ❌ SMS gönderme hatası:", response.statusText);
      }
    } catch (error: any) {
      // SMS hatası kritik değil, sadece log'la
      console.error("[SMS] ❌ SMS gönderme hatası:", error.message);
    }
  };

  const handleSubmit = async () => {
    if (!shop || !service || !date || !time || !name || !phone) {
      setFeedback("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }
    // Personel seçimi zorunlu değil, "Fark Etmez" seçilebilir
    try {
      setSubmitting(true);
      setFeedback(null);
      
      const bookingData = {
        shopId: shop.slug,
        shopName: shop.name,
        shopSlug: shop.slug,
        ownerId: shop.ownerId || null, // İşletme sahibi UID'si
        service,
        staff: selectedStaff || null, // Personel seçimi
        branch: shop.address || shop.name,
        preferredDate: date,
        preferredTime: time,
        duration: shop.services.find((s) => s.name === service)?.duration || null,
        price: shop.services.find((s) => s.name === service)?.price || null,
        name,
        phone,
        notes,
        status: "pending",
        createdAt: serverTimestamp(),
        customerId: user?.uid ?? null,
        customerEmail: user?.email ?? null,
        source: "shop-link",
      };
      
      await addDoc(collection(db, "bookings"), bookingData);
      
      // SMS gönder (async, hata olsa bile devam et)
      try {
        await sendAppointmentSMS(bookingData, shop);
      } catch (smsError: any) {
        console.error("[BookShopPage] SMS gönderme hatası (devam ediliyor):", smsError.message);
        // SMS hatası randevu kaydını engellemez
      }
      
      setFeedback("Randevu talebiniz alındı. İşletme onayladıktan sonra SMS/e-posta ile bilgilendirileceksiniz.");
    } catch (error) {
      console.error("[BookShopPage] submit error", error);
      setFeedback("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        Yükleniyor...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        İşletme bulunamadı.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:px-8" style={{ backgroundColor: '#0a0505' }}>
      {/* WhatsApp'tan açıldığında bilgi mesajı */}
      {isFromWhatsApp && (
        <div className="mx-auto mb-4 max-w-7xl rounded-lg border border-white/20 px-4 py-3 text-sm text-white/90" style={{ backgroundColor: 'rgba(26, 10, 10, 0.8)' }}>
          <div className="flex items-center gap-2">
            <span>📱</span>
            <span>WhatsApp'tan açıldı. Randevu almak için formu doldurun.</span>
          </div>
        </div>
      )}
      <div className="mx-auto w-full max-w-7xl">
        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === 'booking'
                ? 'border-b-2 border-white/40 text-white'
                : 'text-slate-300/70 hover:text-white'
            }`}
          >
            Randevu Al
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === 'reviews'
                ? 'border-b-2 border-white/40 text-white'
                : 'text-slate-300/70 hover:text-white'
            }`}
          >
            Yorumlar {totalReviews > 0 && `(${totalReviews})`}
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === 'pricing'
                ? 'border-b-2 border-white/40 text-white'
                : 'text-slate-300/70 hover:text-white'
            }`}
          >
            Fiyatlar
          </button>
          <button
            onClick={() => setActiveTab('address')}
            className={`px-4 py-3 text-sm font-medium transition ${
              activeTab === 'address'
                ? 'border-b-2 border-white/40 text-white'
                : 'text-slate-300/70 hover:text-white'
            }`}
          >
            Adres
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'booking' && (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Sol Kolon - Profil ve Hizmetler */}
            <div className="space-y-6">
            {/* İşletme Profil Kartı */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: '#1a0a0a' }}>
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {shop.logo ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10">
                      <Image
                        src={shop.logo}
                        alt={`${shop.name} logo`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : shop.photos && shop.photos.length > 0 ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-white/10">
                      <Image
                        src={shop.photos[0]}
                        alt={shop.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/10" style={{ backgroundColor: '#2d0a0a' }}>
                      <span className="text-2xl font-bold text-white">
                        {shop.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* İşletme Bilgileri */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-white truncate">{shop.name}</h1>
                  {shop.description && (
                    <p className="mt-1 text-sm text-slate-300/70 line-clamp-2">{shop.description}</p>
                  )}
                  
                  {/* İletişim Bilgileri */}
                  <div className="mt-4 space-y-2 text-xs text-slate-300/80">
                    {shop.address && (
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">📍</span>
                        <span className="flex-1">{shop.address}</span>
                      </div>
                    )}
                    {shop.phone && (
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <a href={`tel:${shop.phone}`} className="hover:text-white/90 transition">
                          {shop.phone}
                        </a>
                      </div>
                    )}
                    {shop.instagramUrl && (
                      <div className="flex items-center gap-2">
                        <span>📷</span>
                        <a 
                          href={shop.instagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white/90 hover:text-white transition"
                        >
                          Instagram'da Takip Et
                        </a>
                      </div>
                    )}
                    {shop.workingHours && (
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>
                          {shop.workingHours.start} - {shop.workingHours.end}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hizmetler */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Hizmetler</h2>
              <div className="space-y-3">
                {shop.services?.map((serv) => (
                  <div key={serv.name} className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: '#1a0a0a' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{serv.name}</span>
                      <div className="flex items-center gap-3 text-xs text-slate-300/70">
                        <span>{serv.duration} dk</span>
                        <span>·</span>
                        <span className="font-semibold text-white">₺{serv.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Harita (Sol Kolon) */}
            {shop.address && (
              <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ backgroundColor: '#1a0a0a' }}>
                <div id="map-booking" className="w-full h-64" style={{ minHeight: '256px' }}></div>
              </div>
            )}
          </div>

          {/* Sağ Kolon - Randevu Formu */}
          <div>
            <section className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: '#1a0a0a' }}>
              <h2 className="mb-6 text-xl font-semibold text-white">Randevu Talep Formu</h2>
              
              {/* 4 Adımlı Süreç Göstergesi */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    service ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    1
                  </div>
                  <span className={`text-xs ${service ? 'text-white' : 'text-slate-400'}`}>Hizmet</span>
                </div>
                <div className="h-0.5 flex-1 bg-white/10 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    shop.staff && shop.staff.length > 0 && selectedStaff !== undefined ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    2
                  </div>
                  <span className={`text-xs ${shop.staff && shop.staff.length > 0 && selectedStaff !== undefined ? 'text-white' : 'text-slate-400'}`}>Personel</span>
                </div>
                <div className="h-0.5 flex-1 bg-white/10 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    date ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    3
                  </div>
                  <span className={`text-xs ${date ? 'text-white' : 'text-slate-400'}`}>Tarih</span>
                </div>
                <div className="h-0.5 flex-1 bg-white/10 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    time ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    4
                  </div>
                  <span className={`text-xs ${time ? 'text-white' : 'text-slate-400'}`}>Saat</span>
                </div>
              </div>
              
              <div className="space-y-5">
                {/* Hizmet Seçimi */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Hizmet Seçimi</label>
                  <select
                    className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                    style={{ backgroundColor: '#0a0505' }}
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                  >
                    {shop.services?.map((serv) => (
                      <option key={serv.name} value={serv.name} style={{ backgroundColor: '#1a0a0a' }}>
                        {serv.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personel Seçimi */}
                {shop.staff && shop.staff.length > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Personel Seçimi</label>
                    <select
                      className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                      style={{ backgroundColor: '#0a0505' }}
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                    >
                      <option value="" style={{ backgroundColor: '#1a0a0a' }}>Fark Etmez</option>
                      {shop.staff.map((staffName) => (
                        <option key={staffName} value={staffName} style={{ backgroundColor: '#1a0a0a' }}>
                          {staffName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tarih Seçimi */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Tarih</label>
                  {/* Bugün/Yarın Butonları */}
                  <div className="mb-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        setDate(today);
                      }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        date === new Date().toISOString().split("T")[0]
                          ? "border-white/40 text-white"
                          : "border-white/15 text-slate-200/80 hover:border-white/30 hover:bg-white/5"
                      }`}
                      style={date === new Date().toISOString().split("T")[0] ? { backgroundColor: '#2d0a0a' } : { backgroundColor: '#0a0505' }}
                    >
                      Bugün
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setDate(tomorrow.toISOString().split("T")[0]);
                      }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        date === (() => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return tomorrow.toISOString().split("T")[0];
                        })()
                          ? "border-white/40 text-white"
                          : "border-white/15 text-slate-200/80 hover:border-white/30 hover:bg-white/5"
                      }`}
                      style={(() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return date === tomorrow.toISOString().split("T")[0] ? { backgroundColor: '#2d0a0a' } : { backgroundColor: '#0a0505' };
                      })()}
                    >
                      Yarın
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                      style={{ backgroundColor: '#0a0505' }}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {date && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        📅
                      </div>
                    )}
                  </div>
                  {date && (
                    <p className="mt-1 text-xs text-slate-300/60">
                      Seçilen tarih: {new Date(date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Saat Seçimi */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Saat</label>
                  {isClosedDay ? (
                    <div className="rounded-lg border border-white/20 px-4 py-3 text-xs text-white/80" style={{ backgroundColor: 'rgba(45, 10, 10, 0.3)' }}>
                      Bu tarih işletme için kapalı. Lütfen başka bir gün seçin.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.length === 0 ? (
                        <div className="col-span-4 rounded-lg border border-white/10 px-4 py-3 text-xs text-slate-300/70" style={{ backgroundColor: '#0a0505' }}>
                          Bu gün için uygun saat bulunamadı. Lütfen farklı bir tarih seçin.
                        </div>
                      ) : (
                        availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setTime(slot.time)}
                            className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                              time === slot.time
                                ? "border-white/40 text-white"
                                : slot.available
                                ? "border-white/15 text-slate-200/80 hover:border-white/30 hover:bg-white/5"
                                : "border-white/10 text-slate-500/50 cursor-not-allowed"
                            }`}
                            style={time === slot.time ? { backgroundColor: '#2d0a0a' } : slot.available ? { backgroundColor: '#0a0505' } : { backgroundColor: '#0a0505', opacity: 0.5 }}
                          >
                            {slot.time}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Ad Soyad */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Ad Soyad</label>
                  <input
                    className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-white placeholder:text-slate-400/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                    style={{ backgroundColor: '#0a0505' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adınızı giriniz"
                  />
                </div>

                {/* Telefon */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Telefon</label>
                  <input
                    className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-white placeholder:text-slate-400/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                    style={{ backgroundColor: '#0a0505' }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                  />
                </div>

                {/* Not */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Not (Opsiyonel)</label>
                  <textarea
                    className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-white placeholder:text-slate-400/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                    style={{ backgroundColor: '#0a0505' }}
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Özel bir isteğiniz varsa yazın"
                  />
                </div>

                {/* Feedback */}
                {feedback && (
                  <div className="rounded-lg border border-white/20 px-4 py-3 text-sm text-white/90" style={{ backgroundColor: 'rgba(26, 10, 10, 0.5)' }}>
                    {feedback}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ background: 'linear-gradient(to right, #2d0a0a, #1a0a0a, #0a0505)', boxShadow: '0 4px 6px -1px rgba(45, 10, 10, 0.3)' }}
                >
                  {submitting ? "Randevu gönderiliyor..." : "Randevu Talep Et"}
                </button>

                {/* Info Text */}
                {!user && (
                  <p className="text-xs text-slate-300/60 text-center">
                    Hesabınızla giriş yaparsanız randevularınızı &quot;Randevularım&quot; sekmesinden takip edebilirsiniz.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: '#1a0a0a' }}>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-xl">
                        {star <= Math.round(averageRating) ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-slate-300/70">{totalReviews} değerlendirme</div>
                </div>
              </div>
            </div>

            {/* Write Review Form */}
            {user && (
              <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: '#1a0a0a' }}>
                <h3 className="mb-4 text-lg font-semibold text-white">Yorum Yap</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Puan</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-2xl transition hover:scale-110"
                        >
                          {star <= reviewRating ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">Yorumunuz</label>
                    <textarea
                      className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm text-white placeholder:text-slate-400/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
                      style={{ backgroundColor: '#0a0505' }}
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Deneyiminizi paylaşın..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewComment.trim()}
                    className="w-full rounded-lg px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: 'linear-gradient(to right, #2d0a0a, #1a0a0a, #0a0505)', boxShadow: '0 4px 6px -1px rgba(45, 10, 10, 0.3)' }}
                  >
                    {submittingReview ? "Gönderiliyor..." : "Yorumu Gönder"}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Tüm Yorumlar</h3>
              {loadingReviews ? (
                <div className="text-center text-slate-300/70">Yükleniyor...</div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 p-6 text-center text-slate-300/70" style={{ backgroundColor: '#1a0a0a' }}>
                  Henüz yorum yapılmamış. İlk yorumu siz yapın!
                </div>
              ) : (
                reviews.map((review: any) => (
                  <div key={review.id} className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: '#1a0a0a' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{review.customerName || 'Anonim'}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-sm">
                                {star <= (review.rating || 0) ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-sm text-slate-300/80">{review.comment}</p>
                        )}
                        {review.createdAt && (
                          <p className="mt-2 text-xs text-slate-400">
                            {review.createdAt.toDate ? 
                              new Date(review.createdAt.toDate()).toLocaleDateString('tr-TR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 
                              'Tarih bilgisi yok'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: '#1a0a0a' }}>
            <h2 className="mb-6 text-2xl font-semibold text-white">Fiyat Listesi</h2>
            <div className="space-y-4">
              {shop.services?.map((serv) => (
                <div key={serv.name} className="rounded-xl border border-white/10 p-4" style={{ backgroundColor: '#0a0505' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-base font-semibold text-white">{serv.name}</span>
                      <p className="mt-1 text-xs text-slate-300/70">{serv.duration} dakika</p>
                    </div>
                    <span className="text-lg font-bold text-white">₺{serv.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: '#1a0a0a' }}>
              <h2 className="mb-6 text-2xl font-semibold text-white">Adres Bilgileri</h2>
              <div className="space-y-4">
                {shop.address && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Adres</p>
                      <p className="mt-1 text-slate-300/80">{shop.address}</p>
                      {/* Haritada Gör ve Yol Tarifi Butonları */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={openInGoogleMaps}
                          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                          🗺️ Haritada Gör
                        </button>
                        <button
                          onClick={getDirections}
                          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                          🧭 Yol Tarifi Al
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {shop.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="font-semibold text-white">Telefon</p>
                      <a href={`tel:${shop.phone}`} className="mt-1 text-slate-300/80 hover:text-white transition">
                        {shop.phone}
                      </a>
                    </div>
                  </div>
                )}
                {shop.workingHours && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🕐</span>
                    <div>
                      <p className="font-semibold text-white">Çalışma Saatleri</p>
                      <p className="mt-1 text-slate-300/80">
                        {shop.workingHours.start} - {shop.workingHours.end}
                      </p>
                    </div>
                  </div>
                )}
                {shop.description && (
                  <div className="mt-4">
                    <p className="font-semibold text-white">Hakkında</p>
                    <p className="mt-1 text-slate-300/80">{shop.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Harita - Sadece location field'ı varsa göster */}
            {shop.address && shop.location && (
              <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ backgroundColor: '#1a0a0a' }}>
                {mapLoading ? (
                  <div className="flex h-96 items-center justify-center text-slate-300/70">
                    <div className="text-center">
                      <div className="mb-2">Harita yükleniyor...</div>
                      <div className="text-xs text-slate-400">Bu işlem birkaç saniye sürebilir</div>
                    </div>
                  </div>
                ) : (
                  <div id="map" className="w-full h-96" style={{ minHeight: '400px' }}></div>
                )}
              </div>
            )}
            
            {/* Location yoksa bilgi mesajı */}
            {shop.address && !shop.location && (
              <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: '#1a0a0a' }}>
                <div className="text-center text-slate-300/70">
                  <p className="mb-2">Harita görüntülenemiyor.</p>
                  <p className="text-sm text-slate-400">Yukarıdaki "Haritada Gör" veya "Yol Tarifi Al" butonlarını kullanabilirsiniz.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
