# Web Sitesi Production Deployment Rehberi

Bu rehber, web sitenizi production'a geçirmek için gerekli adımları açıklar.

## 📋 Gereksinimler

### 1. Domain (Alan Adı)
**Neden Gerekli:**
- Profesyonel görünüm (`randevum.com` gibi)
- SEO için önemli
- Güvenilirlik ve marka değeri
- iyzico webhook için HTTPS URL gerekli

**Nereden Alınır:**
- **Türkiye:** Turhost, Natro, İsimtescil, GetDomain
- **Uluslararası:** Namecheap, GoDaddy, Cloudflare Registrar
- **Fiyat:** Yıllık ~100-300 TL (domain'e göre değişir)

**Önerilen Domain Uzantıları:**
- `.com` (en popüler, ~150-200 TL/yıl)
- `.com.tr` (Türkiye için, ~100-150 TL/yıl)
- `.app` (modern, ~200-300 TL/yıl)

---

### 2. Hosting / Deployment Platformu

**Seçenekler:**

#### A. Vercel (Önerilen - Next.js için en iyi)
**Avantajlar:**
- ✅ Next.js ile mükemmel entegrasyon
- ✅ Ücretsiz SSL sertifikası (otomatik)
- ✅ Ücretsiz plan mevcut
- ✅ Otomatik deployment (GitHub bağlantısı)
- ✅ CDN dahil
- ✅ Global edge network

**Fiyat:**
- **Hobby (Ücretsiz):** Kişisel projeler için
- **Pro ($20/ay):** Ticari projeler için
- **Enterprise:** Büyük ölçekli projeler

**Kurulum:**
1. [Vercel](https://vercel.com) hesabı oluştur
2. GitHub repo'yu bağla
3. Domain'i bağla
4. Otomatik deploy!

#### B. Netlify
**Avantajlar:**
- ✅ Ücretsiz SSL
- ✅ Kolay kurulum
- ✅ Form handling özellikleri

**Fiyat:**
- **Starter (Ücretsiz):** Kişisel projeler
- **Pro ($19/ay):** Ticari projeler

#### C. Railway / Render
**Avantajlar:**
- ✅ Full-stack uygulamalar için
- ✅ Backend + Frontend birlikte

**Fiyat:**
- **Starter (Ücretsiz):** Sınırlı kaynak
- **Pro ($5-20/ay):** Daha fazla kaynak

#### D. Türk Hosting Firmaları
**Örnekler:**
- Turhost
- Natro
- GetHosting

**Avantajlar:**
- ✅ Türkçe destek
- ✅ Yerel ödeme yöntemleri
- ✅ KVKK uyumlu

**Dezavantajlar:**
- ⚠️ Next.js için özel yapılandırma gerekebilir
- ⚠️ Vercel kadar optimize değil

---

### 3. SSL Sertifikası

**Durum:**
- ✅ Vercel, Netlify gibi platformlar **otomatik SSL** sağlar (Let's Encrypt)
- ✅ Ekstra ücret yok
- ✅ Otomatik yenilenir

**Manuel Hosting İçin:**
- Let's Encrypt (ücretsiz)
- Cloudflare (ücretsiz SSL + CDN)

---

## 🚀 Deployment Adımları

### Seçenek 1: Vercel (Önerilen)

#### Adım 1: Vercel Hesabı Oluştur
1. [vercel.com](https://vercel.com) adresine git
2. GitHub hesabınla giriş yap
3. Ücretsiz hesap oluştur

#### Adım 2: Projeyi Deploy Et
1. Vercel dashboard'da **"Add New Project"** tıkla
2. GitHub repo'nu seç (`Berber` projesi)
3. **Root Directory:** `web` seç
4. **Framework Preset:** Next.js (otomatik algılanır)
5. **Build Command:** `npm run build` (otomatik)
6. **Output Directory:** `.next` (otomatik)
7. **Install Command:** `npm install` (otomatik)

#### Adım 3: Environment Variables Ekle
Vercel dashboard'da **Settings → Environment Variables** bölümüne:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

#### Adım 4: Domain Bağla
1. Vercel dashboard'da **Settings → Domains**
2. Domain adını ekle (örn: `randevum.com`)
3. DNS kayıtlarını güncelle (domain sağlayıcından)
4. SSL otomatik olarak aktif olur

---

### Seçenek 2: Netlify

#### Adım 1: Netlify Hesabı Oluştur
1. [netlify.com](https://netlify.com) adresine git
2. GitHub hesabınla giriş yap

#### Adım 2: Projeyi Deploy Et
1. **"Add new site" → "Import an existing project"**
2. GitHub repo'nu seç
3. **Base directory:** `web`
4. **Build command:** `npm run build`
5. **Publish directory:** `.next`

#### Adım 3: Environment Variables ve Domain
- Netlify dashboard'da environment variables ekle
- Domain'i bağla (ücretsiz SSL otomatik)

---

## 🔧 Backend Deployment

### Backend için Seçenekler:

#### 1. Railway (Önerilen)
- ✅ Kolay kurulum
- ✅ PostgreSQL, Redis dahil
- ✅ Otomatik deployment
- **Fiyat:** $5-20/ay

#### 2. Render
- ✅ Ücretsiz plan mevcut
- ✅ Otomatik SSL
- **Fiyat:** Ücretsiz (sınırlı) veya $7+/ay

#### 3. Heroku (Alternatif)
- ⚠️ Artık ücretsiz plan yok
- **Fiyat:** $7+/ay

#### 4. DigitalOcean / AWS / Google Cloud
- ✅ Daha fazla kontrol
- ⚠️ Daha karmaşık kurulum
- **Fiyat:** $5-50+/ay

---

## 📝 Production Checklist

### Domain ve Hosting
- [ ] Domain satın alındı
- [ ] Domain DNS ayarları yapıldı
- [ ] Web sitesi deploy edildi (Vercel/Netlify)
- [ ] SSL sertifikası aktif (otomatik)
- [ ] Domain web sitesine bağlandı

### Backend
- [ ] Backend deploy edildi (Railway/Render)
- [ ] Backend URL alındı (örn: `https://api.randevum.com`)
- [ ] Backend SSL aktif
- [ ] Environment variables ayarlandı

### Environment Variables
- [ ] Web: Firebase API keys
- [ ] Web: Backend URL
- [ ] Backend: iyzico API keys (production)
- [ ] Backend: NetGSM bilgileri
- [ ] Backend: Firebase Admin SDK

### iyzico Webhook
- [ ] iyzico panelinde webhook URL ayarlandı
- [ ] Webhook URL: `https://your-backend-url.com/api/webhook/iyzico/callback`
- [ ] Webhook test edildi

### Test
- [ ] Web sitesi tüm sayfalarda çalışıyor
- [ ] 404 sayfası test edildi
- [ ] Error sayfası test edildi
- [ ] Booking form çalışıyor
- [ ] SMS gönderimi test edildi
- [ ] Ödeme akışı test edildi

---

## 💰 Tahmini Maliyetler

### Minimum (Başlangıç)
- **Domain:** ~150 TL/yıl
- **Web Hosting (Vercel):** Ücretsiz (Hobby plan)
- **Backend (Railway):** ~$5/ay (~150 TL/ay)
- **Toplam:** ~150 TL/yıl + ~150 TL/ay = **~1,950 TL/yıl**

### Orta Seviye (Ticari)
- **Domain:** ~150 TL/yıl
- **Web Hosting (Vercel Pro):** $20/ay (~600 TL/ay)
- **Backend (Railway):** ~$10/ay (~300 TL/ay)
- **Toplam:** ~150 TL/yıl + ~900 TL/ay = **~10,950 TL/yıl**

### Yüksek Trafik
- **Domain:** ~150 TL/yıl
- **Web Hosting (Vercel Pro):** $20/ay
- **Backend (Railway/Cloud):** ~$50/ay (~1,500 TL/ay)
- **CDN (Cloudflare):** Ücretsiz veya $20/ay
- **Toplam:** ~150 TL/yıl + ~2,100 TL/ay = **~25,350 TL/yıl**

---

## 🎯 Önerilen Yaklaşım

### Başlangıç İçin:
1. **Domain:** `.com` veya `.com.tr` alın (~150 TL/yıl)
2. **Web:** Vercel Hobby (Ücretsiz) - yeterli
3. **Backend:** Railway Starter ($5/ay) - yeterli
4. **Toplam:** ~150 TL/yıl + ~150 TL/ay

### Büyüdükçe:
- Vercel Pro'ya geç ($20/ay)
- Railway'de daha fazla kaynak
- Cloudflare CDN ekle (ücretsiz)

---

## 📞 Sonraki Adımlar

1. **Domain seçimi ve satın alma**
2. **Vercel hesabı oluşturma**
3. **Projeyi deploy etme**
4. **Domain'i bağlama**
5. **Backend'i deploy etme**
6. **Environment variables ayarlama**
7. **Test etme**

---

## ⚠️ Önemli Notlar

1. **Domain:** En az 1 yıl süreyle alın (daha uzun süre daha ucuz)
2. **SSL:** Vercel/Netlify otomatik sağlar, ekstra ücret yok
3. **Backend URL:** Production backend URL'ini iyzico webhook'a eklemeyi unutmayın
4. **Environment Variables:** Production'da mutlaka ayarlanmalı
5. **Backup:** Düzenli yedekleme yapın (Firestore otomatik yedekler)

---

## 🚀 Hızlı Başlangıç

**En hızlı yol:**
1. Domain al (5 dakika)
2. Vercel'e deploy et (10 dakika)
3. Domain'i bağla (5 dakika)
4. Backend'i Railway'e deploy et (15 dakika)
5. Environment variables ayarla (10 dakika)

**Toplam:** ~45 dakika içinde production'a geçebilirsiniz!

