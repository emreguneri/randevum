# Firestore Data Model – Randevum (Mobile + Web)

Bu doküman, mobil uygulama ile Next.js web sitesi aynı veriyi kullanacak şekilde Firestore yapısını standartlaştırmak için hazırlanmıştır.

## 1. Koleksiyon Özeti

| Koleksiyon | Açıklama |
| ---------- | -------- |
| `users` | Son kullanıcılar (müşteri & işletme sahipleri). |
| `shops` | İşletme bilgileri (berber/kuaför). |
| `bookings` | Mobil + web üzerinden oluşturulan randevular. |
| `favorites` _(opsiyonel)_ | Kullanıcının favorilediği işletmeler (gerekirse). |
| `subscriptions` _(opsiyonel)_ | İyzico/ödeme kayıtları tutulacaksa. |

## 2. `users` Koleksiyonu

**Belge ID:** Firebase Auth UID  
**Alanlar:**

| Alan | Tip | Zorunlu | Açıklama |
| ---- | --- | ------- | -------- |
| `email` | string | ✓ | Firebase Auth e-postası |
| `displayName` | string | | Kullanıcı adı/soyadı |
| `role` | `"customer"` veya `"admin"` | ✓ | Müşteri veya işletme sahibi rolü |
| `subscriptionStatus` | `"inactive" \| "active" \| "past_due" \| "cancelled"` | | İşletme sahipleri için abonelik durumu |
| `subscriptionEndsAt` | timestamp | | Aktif aboneliğin bitiş tarihi |
| `createdAt` | timestamp | ✓ | Kayıt zamanı (`serverTimestamp`) |
| `phone` | string | | Opsiyonel iletişim bilgisi |

> Mobil uygulamada AsyncStorage'da tutulan `businessOwner`, `pendingBusinessOwner`, `guestMode` gibi bilgiler bu koleksiyonla senkron olacak.

## 3. `shops` Koleksiyonu

**Belge ID:** `slug` (benzersiz). Eğer slug yoksa Firestore otomatik ID kullanılabilir; slug alanı zorunludur.  
**Alanlar:**

| Alan | Tip | Zorunlu | Açıklama |
| ---- | --- | ------- | -------- |
| `ownerId` | string | ✓ | `users/{uid}` referansı |
| `name` | string | ✓ | İşletme adı |
| `slug` | string | ✓ | Paylaşılabilir URL (`/book/{slug}`) |
| `address` | string | | Adres |
| `location` | object | | `latitude`, `longitude` (geocoding sonrası) |
| `description` | string | | Açıklama |
| `services` | array | ✓ | `{ name, duration, price }` nesneleri |
| `workingHours` | object | | `{ start: "09:00", end: "21:00" }` |
| `workingDays` | number[] | | Haftalık çalışma günleri (`0` pazar, `1` pazartesi ...) |
| `photos` | array | | Fotoğraf URL’leri |
| `phone` | string | | İşletme telefonu |
| `rating` | number | | Google Places vb. ortalama puan |
| `totalRatings` | number | | Oylama sayısı |
| `isPaymentActive` | boolean | ✓ | Abonelik ödendi mi? |
| `subscriptionEndsAt` | timestamp | | (Ödeme modülünden beslenir) |
| `shareUrl` | string | | Web’de kullanılan paylaşım linki |
| `updatedAt` | timestamp | ✓ | `serverTimestamp()` |

> Mobilde AsyncStorage’da saklanan `allShops`, `shopInfo` vb. veriler bu koleksiyondan alınacak. Gerekiyorsa yerelde cache’lenebilir ama gerçek kaynak burası olacak.

## 4. `bookings` Koleksiyonu

**Belge ID:** Otomatik (Firestore ID).  
**Alanlar:**

| Alan | Tip | Zorunlu | Açıklama |
| ---- | --- | ------- | -------- |
| `shopId` | string | ✓ | `shops/{id}` veya `slug` |
| `shopSlug` | string | ✓ | URL amaçlı tekrar |
| `shopName` | string | | Gösterim için |
| `ownerId` | string | | İşletme sahibinin UID’si (hızlı filtre için) |
| `customerId` | string | | Müşteri UID’si. Üye olmadan randevu varsa `null` olabilir |
| `customerEmail` | string | | Müşteri maili |
| `name` | string | ✓ | Randevu sahibinin adı |
| `phone` | string | ✓ | İletişim telefonu |
| `service` | string | ✓ | Seçilen hizmet adı |
| `duration` | number | | Hizmet süresi (dakika) |
| `price` | number | | Hizmet ücreti |
| `branch` | string | | Şube/adres |
| `preferredDate` | string | ✓ | `YYYY-MM-DD` |
| `preferredTime` | string | ✓ | `HH:mm` |
| `status` | `"pending" \| "confirmed" \| "cancelled"` | ✓ | Varsayılan `pending` |
| `notes` | string | | Opsiyonel not |
| `source` | string | | `"mobile"` veya `"web"` gibi izleme amaçlı |
| `createdAt` | timestamp | ✓ | `serverTimestamp()` |
| `updatedAt` | timestamp | | Durum değişikliklerinde güncellenebilir |

> Web tarafında `updateStatus` fonksiyonu şu anda `web_bookings` koleksiyonuna yazıyor; mobil ile ortak çalışabilmek için tek koleksiyon `bookings` kullanılacak (gerekirse geçmiş kayıtlar taşınacak).

## 5. Opsiyonel Koleksiyonlar

### `favorites`
- **Belge ID:** Otomatik.
- **Alanlar:** `userId`, `shopId`, `createdAt`.
- Mobilde favorilere eklenen işletmeleri Firestore’da tutmak istersen kullanılabilir.

### `subscriptions`
- İyzico ödeme kayıtları için `ownerId`, `planId`, `status`, `startedAt`, `renewalAt` vb. alanlar içeren koleksiyon oluşturulabilir.
- Abonelik bilgileri `shops` ve `users` dokümanlarına yansıtılabilir.

## 6. Güvenlik Kuralları Taslağı

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }

    match /shops/{shopId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
    }

    match /bookings/{bookingId} {
      allow create: if true; // Üye olmadan randevu için.
      allow read: if request.auth != null
        && (request.auth.uid == resource.data.customerId
            || request.auth.uid == resource.data.ownerId);
      allow update: if request.auth != null
        && (request.auth.uid == resource.data.ownerId
            || request.auth.uid == resource.data.customerId);
    }
  }
}
```

> Kurallar taslaktır; alan isimleri değiştikçe güncellenmelidir. Özellikle `ownerId` veya `customerId` gibi alanların dokümanda mevcut olduğundan emin olun.

## 7. Geçiş (Migration) Notları

1. **Kullanıcılar:** Mobilde oturum açan herkesi Firestore `users` dokümanına senkronize et.
2. **İşletmeler:** Mobilde kayıtlı `shopInfo` ve `allShops` verilerini Firestore’a taşı. Slug üretimini standartlaştır.
3. **Randevular:** AsyncStorage’daki mevcut randevu kayıtlarını (varsa) Firestore `bookings` koleksiyonuna manuel import et ya da test için sıfırla.
4. **AsyncStorage Temizliği:** Firestore’a geçildikten sonra sadece cache/depolama için gerekli alanlar bırakılmalı.
5. **Web Koleksiyon Adı:** `web_bookings` yerine `bookings` kullanılacak. Eski kayıtları taşıyıp koleksiyon adını güncelle.

## 8. Sonraki Adımlar

1. `config/firebase.ts` ve mobil servisler Firestore kullanımına uygun hale getirilecek.
2. Mobil kayıt & login işlemleri Firestore `users` verisini güncelleyecek.
3. Mobil `shop-info`, `booking`, `profile`, `explore`, `favorites` ekranları Firestore’dan veri okuyacak/yazacak.
4. Firestore kuralları güncellenip test edilecek.
5. Web tarafında `bookings` güncelleme fonksiyonu ve diğer alanlar yeni şemayla eşlenecek.

Bu doküman ilerleyen adımlarda yapılacak kod değişiklikleri için referans olarak kullanılacaktır.

