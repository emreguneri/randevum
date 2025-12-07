# 🚀 Domain Alındı - Production Deployment Rehberi

Domain'inizi aldınız! Şimdi production'a geçmek için aşağıdaki adımları takip edin.

## 📋 Hızlı Checklist

- [ ] 1. Web sitesini Vercel'e deploy et
- [ ] 2. Backend'i Railway/Render'e deploy et  
- [ ] 3. Domain'i web sitesine bağla
- [ ] 4. Environment variables ayarla
- [ ] 5. iyzico webhook URL'ini güncelle
- [ ] 6. Test et

---

## 🎯 Adım 1: Web Sitesini Vercel'e Deploy Et

### 1.1 Vercel Hesabı Oluştur
1. [vercel.com](https://vercel.com) adresine git
2. GitHub hesabınla giriş yap
3. Ücretsiz hesap oluştur

### 1.2 Projeyi Deploy Et
1. Vercel dashboard'da **"Add New Project"** tıkla
2. GitHub repo'nu seç (`Berber` projesi)
3. **Root Directory:** `web` seç (önemli!)
4. **Framework Preset:** Next.js (otomatik algılanır)
5. **Build Command:** `npm run build` (otomatik)
6. **Output Directory:** `.next` (otomatik)
7. **Install Command:** `npm install` (otomatik)
8. **Deploy** butonuna tıkla

### 1.3 İlk Deploy Sonrası
- Vercel otomatik olarak bir URL verecek (örn: `berber-xyz.vercel.app`)
- Bu URL'i not alın, backend için kullanacağız

---

## 🎯 Adım 2: Backend'i Deploy Et

### Seçenek A: Railway (Önerilen)

#### 2.1 Railway Hesabı Oluştur
1. [railway.app](https://railway.app) adresine git
2. GitHub hesabınla giriş yap
3. Ücretsiz hesap oluştur ($5 kredi veriyorlar)

#### 2.2 Backend'i Deploy Et
1. Railway dashboard'da **"New Project"** tıkla
2. **"Deploy from GitHub repo"** seç
3. `Berber` repo'sunu seç
4. **Root Directory:** `server` seç
5. **Start Command:** `npm start`
6. Railway otomatik deploy edecek

#### 2.3 Backend URL'ini Al
1. Deploy tamamlandıktan sonra **"Settings"** → **"Generate Domain"** tıkla
2. Backend URL'i not alın (örn: `berber-backend.railway.app`)
3. Bu URL'i iyzico webhook için kullanacağız

#### 2.4 Environment Variables Ekle (Railway)
Railway dashboard'da **"Variables"** sekmesine git ve şunları ekle:

```env
PORT=4000
NODE_ENV=production

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key

# iyzico Production Keys
IYZICO_API_KEY=your-production-api-key
IYZICO_SECRET_KEY=your-production-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com

# NetGSM SMS
NETGSM_USERNAME=your-netgsm-username
NETGSM_PASSWORD=your-netgsm-password
NETGSM_MSGHEADER=RANDEVUM
NETGSM_API_URL=https://api.netgsm.com.tr/sms/send/get
```

**Önemli:** Firebase Admin SDK private key'i tek satırda, `\n` karakterleriyle yazın:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

### Seçenek B: Render (Alternatif)

#### 2.1 Render Hesabı Oluştur
1. [render.com](https://render.com) adresine git
2. GitHub hesabınla giriş yap

#### 2.2 Backend'i Deploy Et
1. **"New +"** → **"Web Service"** seç
2. GitHub repo'yu bağla
3. **Root Directory:** `server`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. **Environment:** `Node`
7. Deploy et

#### 2.3 Environment Variables Ekle (Render)
Render dashboard'da **"Environment"** sekmesine git ve yukarıdaki environment variables'ları ekle.

---

## 🎯 Adım 3: Domain'i Web Sitesine Bağla

### 3.1 Vercel'de Domain Ekle
1. Vercel dashboard'da projenize git
2. **Settings** → **Domains** sekmesine git
3. Domain adınızı ekleyin (örn: `randevum.com`)
4. Vercel size DNS kayıtlarını gösterecek

### 3.2 DNS Kayıtlarını Güncelle
Domain sağlayıcınızın (Turhost, Natro, vb.) DNS ayarlarına git ve şu kayıtları ekle:

**Vercel'in verdiği kayıtlar:**
- **Type:** `A` veya `CNAME`
- **Name:** `@` veya boş (root domain için)
- **Value:** Vercel'in verdiği IP veya CNAME değeri

**Örnek (onlinerandevum.com için):**
```
Type: A
Name: @
Value: 76.76.21.21
```

veya

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Not:** Domain'iniz `onlinerandevum.com` olduğu için, Vercel size özel DNS kayıtları verecek. Bu kayıtları domain sağlayıcınızda ayarlayın.

### 3.3 SSL Sertifikası
- Vercel otomatik olarak SSL sertifikası sağlar (Let's Encrypt)
- DNS kayıtları doğrulandıktan sonra 1-2 dakika içinde aktif olur
- HTTPS otomatik çalışır

---

## 🎯 Adım 4: Environment Variables Ayarla

### 4.1 Web Sitesi (Vercel) Environment Variables
Vercel dashboard'da **Settings** → **Environment Variables** sekmesine git:

```env
# Firebase (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Backend URL (Production)
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
# veya
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com

# Site URL
NEXT_PUBLIC_SITE_URL=https://onlinerandevum.com
```

**Önemli:** Environment variables ekledikten sonra **"Redeploy"** yapın!

---

## 🎯 Adım 5: iyzico Webhook URL'ini Güncelle

### 5.1 iyzico Production Hesabı
1. [iyzico.com](https://iyzico.com) adresine git
2. Production hesabınıza giriş yapın
3. **Ayarlar** → **Webhook URL** bölümüne git

### 5.2 Webhook URL'ini Ayarla
Webhook URL'ini şu formatta ayarlayın:
```
https://your-backend-url.railway.app/api/webhook/iyzico/callback
```

veya Render kullanıyorsanız:
```
https://your-backend-url.onrender.com/api/webhook/iyzico/callback
```

### 5.3 Webhook Test Et
- iyzico panelinde test butonu varsa kullanın
- Veya gerçek bir ödeme yaparak test edin

---

## 🎯 Adım 6: Mobil Uygulama için Backend URL Güncelle

### 6.1 Environment Variable Ekle
Mobil uygulamada backend URL'ini güncellemek için:

1. `app/booking.tsx` dosyasında:
```typescript
const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://your-backend-url.railway.app';
```

2. `app.json` veya `.env` dosyasında:
```env
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
```

**Not:** Expo'da environment variables için `EXPO_PUBLIC_` prefix'i kullanılır.

---

## 🎯 Adım 7: Test Et

### 7.1 Web Sitesi Testleri
- [ ] Ana sayfa açılıyor mu?
- [ ] Booking form çalışıyor mu?
- [ ] Login/Register çalışıyor mu?
- [ ] Dashboard açılıyor mu?
- [ ] 404 sayfası çalışıyor mu?

### 7.2 Backend Testleri
- [ ] Backend URL'e erişilebiliyor mu?
- [ ] SMS gönderimi çalışıyor mu?
- [ ] iyzico webhook çalışıyor mu?

### 7.3 Ödeme Testleri
- [ ] Test ödemesi yapılabiliyor mu?
- [ ] Webhook callback alınıyor mu?
- [ ] Randevu oluşturuluyor mu?

---

## 🔧 Sorun Giderme

### Domain DNS Sorunları
- DNS kayıtlarının yayılması 24-48 saat sürebilir
- [whatsmydns.net](https://www.whatsmydns.net) ile kontrol edin
- Domain sağlayıcınızın DNS ayarlarını kontrol edin

### SSL Sertifikası Sorunları
- Vercel otomatik SSL sağlar, 1-2 dakika içinde aktif olur
- DNS kayıtları doğruysa SSL otomatik çalışır
- Sorun varsa Vercel support'a başvurun

### Backend Bağlantı Sorunları
- Backend URL'inin doğru olduğundan emin olun
- Environment variables'ların doğru olduğunu kontrol edin
- Railway/Render logs'ları kontrol edin

### CORS Sorunları
- Backend'de CORS ayarlarını kontrol edin
- Frontend URL'ini backend CORS whitelist'ine ekleyin

---

## 📝 Önemli Notlar

1. **Domain:** DNS kayıtlarının yayılması 24-48 saat sürebilir
2. **SSL:** Vercel otomatik sağlar, ekstra ücret yok
3. **Backend URL:** Production backend URL'ini iyzico webhook'a eklemeyi unutmayın
4. **Environment Variables:** Production'da mutlaka ayarlanmalı
5. **Firebase:** Production Firebase projesi kullanıldığından emin olun

---

## 🎉 Başarılı Deployment Sonrası

1. ✅ Web sitesi production'da çalışıyor
2. ✅ Backend production'da çalışıyor
3. ✅ Domain bağlandı ve SSL aktif
4. ✅ iyzico webhook çalışıyor
5. ✅ SMS gönderimi çalışıyor

**Artık production'da yayındasınız! 🚀**

---

## 📞 Yardım

Sorun yaşarsanız:
1. Vercel/Railway/Render logs'larını kontrol edin
2. Browser console'da hataları kontrol edin
3. Network tab'da API isteklerini kontrol edin
4. Firebase Console'da güvenlik kurallarını kontrol edin

---

## 💰 Tahmini Maliyetler

### Minimum (Başlangıç)
- **Domain:** ~150 TL/yıl (zaten aldınız ✅)
- **Web Hosting (Vercel):** Ücretsiz (Hobby plan)
- **Backend (Railway):** ~$5/ay (~150 TL/ay)
- **Toplam:** ~150 TL/ay

### Büyüdükçe
- Vercel Pro: $20/ay (daha fazla bandwidth)
- Railway: $10-20/ay (daha fazla kaynak)

---

**Başarılar! 🎉**

