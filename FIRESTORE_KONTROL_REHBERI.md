# Firestore'da Abonelik Durumunu Kontrol Etme Rehberi

Bu rehber, iyzico ödeme işlemi sonrası Firestore'da abonelik bilgilerinin doğru kaydedilip kaydedilmediğini kontrol etmenize yardımcı olur.

## 📋 İçindekiler

1. [Firebase Console'a Giriş](#1-firebase-consolea-giriş)
2. [Firestore Veritabanını Açma](#2-firestore-veritabanını-açma)
3. [Kullanıcı Belgesini Bulma](#3-kullanıcı-belgesini-bulma)
4. [Abonelik Bilgilerini Kontrol Etme](#4-abonelik-bilgilerini-kontrol-etme)
5. [Kontrol Edilecek Alanlar](#5-kontrol-edilecek-alanlar)
6. [Sorun Giderme](#6-sorun-giderme)

---

## 1. Firebase Console'a Giriş

1. Tarayıcınızda [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Google hesabınızla giriş yapın
3. Projenizi seçin: **randevum-66b5e** (veya proje adınız)

---

## 2. Firestore Veritabanını Açma

1. Sol menüden **"Firestore Database"** (veya **"Veritabanı"**) seçeneğine tıklayın
2. Eğer ilk kez açıyorsanız, "Test modunda başlat" veya "Production modunda başlat" seçeneğini seçin

---

## 3. Kullanıcı Belgesini Bulma

### Yöntem 1: Koleksiyon Üzerinden

1. Sol panelde **`users`** koleksiyonunu bulun ve tıklayın
2. Koleksiyon içindeki belgeler listelenir
3. Kullanıcı ID'nizi (Firebase Auth'daki UID) biliyorsanız, doğrudan belgeyi bulabilirsiniz

### Yöntem 2: Arama ile

1. Firestore'da üst kısımdaki **"Search"** (Ara) kutusunu kullanın
2. Email adresinizi veya kullanıcı ID'nizi yazın
3. İlgili belgeyi bulun

### Kullanıcı ID'nizi Bulma

**Mobil Uygulamadan:**
- Profil ekranında kullanıcı bilgileriniz görünür
- Firebase Auth'dan alınan UID, genellikle rastgele bir string'dir (örn: `abc123def456...`)

**Firebase Console'dan:**
1. Sol menüden **"Authentication"** (Kimlik Doğrulama) seçeneğine tıklayın
2. **"Users"** sekmesinde kullanıcılarınızı görürsünüz
3. Email adresinize tıklayın
4. **"User UID"** değerini kopyalayın

---

## 4. Abonelik Bilgilerini Kontrol Etme

1. **`users`** koleksiyonunda kullanıcı belgenizi açın
2. Belge içeriği JSON formatında görünecektir
3. Aşağıdaki alanları kontrol edin:

---

## 5. Kontrol Edilecek Alanlar

### ✅ Zorunlu Alanlar (Ödeme başarılıysa mutlaka olmalı)

```json
{
  "role": "admin",
  "subscriptionStatus": "active",
  "subscriptionPlan": "business-monthly",
  "subscriptionProvider": "iyzico",
  "subscriptionEndsAt": "2025-12-17T19:32:41.405Z",  // Timestamp veya string
  "subscriptionStartedAt": "2025-11-17T19:32:41.405Z",  // Timestamp
  "iyzico": {
    "customerReferenceCode": "04e2b8c8-dd87-4df2-9404-9a259356633c",
    "subscriptionReferenceCode": "d0cd795a-28f4-4388-9382-1240dd52cb2b",
    "pricingPlanReferenceCode": "36c64d02-0a60-4d41-a4ca-6626b9f6998d"
  }
}
```

### 📝 Alan Açıklamaları

| Alan | Açıklama | Örnek Değer |
|------|----------|-------------|
| `role` | Kullanıcı rolü | `"admin"` |
| `subscriptionStatus` | Abonelik durumu | `"active"` veya `"inactive"` |
| `subscriptionPlan` | Abonelik planı | `"business-monthly"` |
| `subscriptionProvider` | Ödeme sağlayıcı | `"iyzico"` |
| `subscriptionEndsAt` | Abonelik bitiş tarihi | Timestamp veya ISO string |
| `subscriptionStartedAt` | Abonelik başlangıç tarihi | Timestamp |
| `iyzico.customerReferenceCode` | iyzico müşteri referans kodu | UUID formatında |
| `iyzico.subscriptionReferenceCode` | iyzico abonelik referans kodu | UUID formatında |
| `iyzico.pricingPlanReferenceCode` | iyzico plan referans kodu | UUID formatında |

---

## 6. Sorun Giderme

### ❌ `subscriptionStatus` görünmüyor veya `"inactive"`

**Olası Nedenler:**
- Ödeme işlemi tamamlanmamış olabilir
- Firestore'a yazma işlemi başarısız olmuş olabilir
- Network hatası olmuş olabilir

**Çözüm:**
1. Mobil uygulama console log'larını kontrol edin
2. Backend server log'larını kontrol edin
3. Ödeme işlemini tekrar deneyin

### ❌ `iyzico` objesi eksik

**Olası Nedenler:**
- Backend'den dönen response'ta `iyzico` bilgileri eksik olabilir
- Firestore'a yazma sırasında hata oluşmuş olabilir

**Çözüm:**
1. Backend server log'larını kontrol edin
2. `app/payment.tsx` dosyasındaki Firestore yazma kodunu kontrol edin

### ❌ `subscriptionEndsAt` tarihi yanlış

**Kontrol:**
- `subscriptionEndsAt` tarihi, ödeme tarihinden 30 gün sonra olmalı
- Örnek: Ödeme 17 Kasım 2025'te yapıldıysa, bitiş tarihi 17 Aralık 2025 olmalı

---

## 🔍 Hızlı Kontrol Listesi

Ödeme işlemi sonrası şunları kontrol edin:

- [ ] `users/{uid}` belgesi var mı?
- [ ] `role: "admin"` ayarlanmış mı?
- [ ] `subscriptionStatus: "active"` var mı?
- [ ] `subscriptionEndsAt` tarihi doğru mu? (30 gün sonra)
- [ ] `iyzico` objesi var mı?
- [ ] `iyzico.customerReferenceCode` var mı?
- [ ] `iyzico.subscriptionReferenceCode` var mı?
- [ ] `iyzico.pricingPlanReferenceCode` var mı?

---

## 📸 Görsel Rehber

### Firestore'da `users` Koleksiyonu
```
Firestore Database
└── users (koleksiyon)
    └── {user-uid} (belge)
        ├── role: "admin"
        ├── subscriptionStatus: "active"
        ├── subscriptionEndsAt: Timestamp
        └── iyzico: {
            ├── customerReferenceCode: "..."
            ├── subscriptionReferenceCode: "..."
            └── pricingPlanReferenceCode: "..."
        }
```

---

## 💡 İpuçları

1. **Timestamp Formatı:** Firestore'da tarihler `Timestamp` objesi olarak görünebilir. Tıklayarak detayları görebilirsiniz.

2. **Gerçek Zamanlı Güncellemeler:** Firestore Console'da belgeyi açık tutarsanız, gerçek zamanlı güncellemeleri görebilirsiniz.

3. **Export:** Belgeyi JSON formatında export edebilirsiniz (belgeye sağ tıklayın → "Export").

4. **Filtreleme:** Firestore'da filtreleme yaparak aktif abonelikleri bulabilirsiniz:
   - `subscriptionStatus == "active"`

---

## 🆘 Yardım

Sorun yaşıyorsanız:
1. Mobil uygulama console log'larını kontrol edin
2. Backend server log'larını kontrol edin
3. Firebase Console'da "Usage and billing" bölümünden Firestore kullanımını kontrol edin

