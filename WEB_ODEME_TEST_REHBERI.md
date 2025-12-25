# Web Sitesinden Ödeme Test Rehberi

Bu rehber, web sitesinden iyzico ödeme entegrasyonunu test etmenize yardımcı olur.

## 📋 İçindekiler

1. [Ön Hazırlık](#1-ön-hazırlık)
2. [Backend Server'ı Başlatma](#2-backend-serverı-başlatma)
3. [Web Sitesini Başlatma](#3-web-sitesini-başlatma)
4. [Test Adımları](#4-test-adımları)
5. [Sorun Giderme](#5-sorun-giderme)

---

## 1. Ön Hazırlık

### 1.1 Backend URL'i Ayarlama

Web sitesinin backend'e erişebilmesi için environment variable ayarlamanız gerekiyor.

**Seçenek A: `.env.local` dosyası oluşturma (Önerilen)**

```bash
cd web
touch .env.local
```

`.env.local` dosyasına şunu ekleyin:

```env
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.163:4000
```

**Not:** `192.168.1.163` yerine kendi bilgisayarınızın IP adresini yazın. IP adresinizi öğrenmek için:

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

**Seçenek B: Doğrudan kodda değiştirme**

Eğer `.env.local` kullanmak istemiyorsanız, `web/src/app/payment/page.tsx` dosyasında:

```typescript
const BACKEND_API_URL = "http://192.168.1.163:4000"; // IP adresinizi buraya yazın
```

---

## 2. Backend Server'ı Başlatma

Backend server'ın çalıştığından emin olun:

```bash
cd server
npm run dev
```

Başarılı olursa şu mesajı görmelisiniz:
```
iyzico entegrasyon sunucusu 4000 portunda çalışıyor
```

**Test:** Tarayıcıda `http://localhost:4000/api/health` adresine gidin. Şunu görmelisiniz:
```json
{"status":"ok","timestamp":"..."}
```

---

## 3. Web Sitesini Başlatma

### 3.1 Web Sitesini Çalıştırma

Yeni bir terminal penceresi açın:

```bash
cd web
npm run dev
```

Başarılı olursa şu mesajı görmelisiniz:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - ready started server on 0.0.0.0:3000
```

### 3.2 Tarayıcıda Açma

Tarayıcınızda `http://localhost:3000` adresine gidin.

---

## 4. Test Adımları

### Adım 1: İşletme Sahibi Olarak Kayıt Olun

1. Web sitesinde **"Kayıt Ol"** butonuna tıklayın
2. **"İşletme Sahibi"** seçeneğini seçin
3. Formu doldurun:
   - Email: `test@example.com` (veya istediğiniz bir email)
   - Şifre: En az 6 karakter
   - Ad Soyad: `Test İşletme`
4. **"Kayıt Ol"** butonuna tıklayın

### Adım 2: Giriş Yapın

1. **"Giriş Yap"** butonuna tıklayın
2. Kayıt olduğunuz email ve şifreyi girin
3. **"Giriş Yap"** butonuna tıklayın

### Adım 3: Ödeme Sayfasına Gidin

**Yöntem 1: Navbar'dan**
1. Sağ üst köşedeki **"Profilim"** butonuna tıklayın
2. Açılan menüde **"İşletme Sahibi"** bölümünde **"💳 Ödeme Yap"** linkine tıklayın

**Yöntem 2: Direkt URL**
Tarayıcıda `http://localhost:3000/payment` adresine gidin

### Adım 4: Ödeme Formunu Doldurun

#### İletişim Bilgileri:
- **Ad Soyad:** `Test İşletme` (otomatik doldurulmuş olabilir)
- **Telefon:** `5321234567` (10 haneli, 05xx ile başlamalı)
- **TC Kimlik No:** `11111111111` (opsiyonel, test için)

#### Kart Bilgileri:
- **Kart Numarası:** `5528790000000008`
- **Kart Sahibi:** `TEST USER`
- **Son Kullanma:** `12/30` (veya gelecek bir tarih)
- **CVV:** `123`

### Adım 5: Ödeme Yapın

1. **"800 ₺ Öde"** butonuna tıklayın
2. İşlem işlenirken **"İşleniyor..."** mesajı görünecek
3. Başarılı olursa:
   - **"Ödeme Başarılı!"** alert mesajı görünecek
   - Otomatik olarak `/dashboard/shop` sayfasına yönlendirileceksiniz

### Adım 6: Sonucu Kontrol Edin

#### Firestore'da Kontrol:
1. [Firebase Console](https://console.firebase.google.com/) → Firestore Database
2. `users` koleksiyonunda kullanıcı belgenizi açın
3. Şu alanların olduğunu kontrol edin:
   - `role: "admin"`
   - `subscriptionStatus: "active"`
   - `subscriptionPlan: "business-monthly"`
   - `iyzico` objesi (customerReferenceCode, subscriptionReferenceCode, vb.)

#### Web Sitesinde Kontrol:
1. **"Profilim"** → **"İşletme Sahibi"** menüsüne bakın
2. **"💳 Ödeme Yap"** linki artık görünmemeli (çünkü abonelik aktif)
3. **"İşletme Bilgilerim"** linkine tıklayarak mekan ekleyebilirsiniz

---

## 5. Sorun Giderme

### ❌ "Network Error" veya "Failed to fetch"

**Neden:** Backend server'a erişilemiyor

**Çözüm:**
1. Backend server'ın çalıştığından emin olun (`cd server && npm run dev`)
2. `NEXT_PUBLIC_BACKEND_URL` environment variable'ının doğru olduğundan emin olun
3. IP adresinin doğru olduğundan emin olun
4. Firewall'ın 4000 portunu engellemediğinden emin olun

**Test:**
```bash
# Terminal'den test edin
curl http://192.168.1.163:4000/api/health
```

### ❌ "Property 'cvc' doesn't exist"

**Neden:** Backend'de CVC alanı eksik

**Çözüm:** Bu hata düzeltildi, ancak hala görüyorsanız:
1. Backend server'ı yeniden başlatın
2. Web sitesini yeniden başlatın (hard refresh: Ctrl+Shift+R veya Cmd+Shift+R)

### ❌ "Müşteri zaten var" hatası

**Neden:** Aynı email ile daha önce ödeme yapılmış

**Çözüm:** 
- Farklı bir email ile test edin
- Veya iyzico sandbox panelinden mevcut müşteriyi silin

### ❌ Ödeme sayfası açılmıyor / 404 hatası

**Neden:** Sayfa bulunamıyor

**Çözüm:**
1. Web sitesinin doğru çalıştığından emin olun (`npm run dev`)
2. URL'in doğru olduğundan emin olun: `http://localhost:3000/payment`
3. Giriş yapmış olduğunuzdan emin olun

### ❌ "Ödeme Yap" linki görünmüyor

**Neden:** Kullanıcı admin değil veya zaten aktif aboneliği var

**Çözüm:**
1. İşletme sahibi olarak kayıt olduğunuzdan emin olun
2. Firestore'da `users/{uid}` belgesinde `role: "admin"` olduğundan emin olun
3. Eğer zaten aktif aboneliğiniz varsa, Firestore'dan `subscriptionStatus: "inactive"` yapın

---

## 🔍 Debug İpuçları

### Browser Console'u Açma

1. Tarayıcıda **F12** veya **Cmd+Option+I** (Mac) tuşlarına basın
2. **Console** sekmesine gidin
3. Hata mesajlarını kontrol edin

### Network Tab'ını Kontrol Etme

1. Browser DevTools'da **Network** sekmesine gidin
2. Ödeme butonuna tıklayın
3. `/api/payments/subscribe` isteğini bulun
4. **Status** ve **Response** kısımlarını kontrol edin

### Backend Log'larını Kontrol Etme

Backend server terminal'inde şu log'ları görmelisiniz:

```
[Payments] subscribe request received
[iyzico] Creating pricing plan...
[iyzico] Creating customer...
[iyzico] Initializing subscription...
```

---

## ✅ Başarı Kriterleri

Test başarılı sayılır eğer:

- [ ] Ödeme sayfası açılıyor
- [ ] Form validasyonu çalışıyor
- [ ] Backend'e istek gönderiliyor
- [ ] Ödeme başarılı mesajı görünüyor
- [ ] Firestore'da abonelik bilgileri kaydediliyor
- [ ] Web sitesinde "Ödeme Yap" linki kayboluyor
- [ ] "İşletme Bilgilerim" sayfasına erişilebiliyor

---

## 📝 Test Kartı Bilgileri (iyzico Sandbox)

```
Kart Numarası: 5528790000000008
Son Kullanma: 12/30 (veya gelecek bir tarih)
CVV: 123
Kart Sahibi: TEST USER (veya herhangi bir isim)
```

**Not:** Bu test kartları sadece sandbox ortamında çalışır. Gerçek ödeme yapmaz.

---

## 🆘 Yardım

Sorun yaşıyorsanız:

1. Browser console log'larını kontrol edin
2. Backend server log'larını kontrol edin
3. Network tab'ında istek/response'ları kontrol edin
4. Firestore'da kullanıcı belgesini kontrol edin

