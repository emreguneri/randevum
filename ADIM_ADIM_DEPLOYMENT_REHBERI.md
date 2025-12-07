# 🚀 Adım Adım Deployment Rehberi (Canlıya Alma)

Bu rehber, web sitenizi ve backend'inizi canlıya almak için **adım adım** ne yapmanız gerektiğini açıklar.

---

## 📖 Önce Anlayalım: Ne Yapacağız?

**Şu anda:**
- Kodlarınız bilgisayarınızda (local)
- Sadece siz görebiliyorsunuz

**Yapacağımız:**
- Web sitenizi internete yükleyeceğiz (Vercel)
- Backend'inizi internete yükleyeceğiz (Railway)
- Domain'inizi (`onlinerandevum.com`) bağlayacağız
- Herkes internetten erişebilecek

---

## 🎯 ADIM 1: Web Sitesini Canlıya Al (Vercel)

### 1.1 Vercel Hesabı Oluştur

1. **Tarayıcınızda şu adrese gidin:**
   ```
   https://vercel.com
   ```

2. **Sağ üstte "Sign Up" (Kayıt Ol) butonuna tıklayın**

3. **"Continue with GitHub" seçeneğini seçin**
   - GitHub hesabınızla giriş yapın
   - Eğer GitHub hesabınız yoksa, önce GitHub'da hesap oluşturun (ücretsiz)

4. **Vercel hesabınız hazır!** ✅

---

### 1.2 Projenizi Vercel'e Yükleyin

1. **Vercel dashboard'da (ana sayfada) "Add New Project" butonuna tıklayın**

2. **GitHub repo'nuzu seçin:**
   - `Berber` projesini göreceksiniz
   - Yanındaki "Import" butonuna tıklayın

3. **ÖNEMLİ AYARLAR:**
   
   **Root Directory:** 
   - "Configure Project" butonuna tıklayın
   - "Root Directory" kısmında `web` yazın
   - (Bu, Vercel'e `web` klasöründeki dosyaları kullanmasını söyler)

   **Framework Preset:**
   - Otomatik olarak "Next.js" seçilecek (değiştirmeyin)

   **Build Command:**
   - Otomatik: `npm run build` (değiştirmeyin)

   **Output Directory:**
   - Otomatik: `.next` (değiştirmeyin)

4. **"Deploy" butonuna tıklayın**

5. **Bekleyin (2-3 dakika sürebilir)**
   - Vercel otomatik olarak:
     - Kodlarınızı yükler
     - Bağımlılıkları kurar
     - Projeyi derler
     - Canlıya alır

6. **Başarılı!** ✅
   - Size bir URL verecek: `berber-xyz123.vercel.app`
   - Bu URL'yi not alın (geçici URL, sonra domain bağlayacağız)

---

### 1.3 Environment Variables (Gizli Bilgiler) Ekle

**Ne demek?** Firebase, backend URL gibi gizli bilgileri Vercel'e söylememiz gerekiyor.

1. **Vercel dashboard'da projenize tıklayın**

2. **"Settings" (Ayarlar) sekmesine gidin**

3. **"Environment Variables" (Ortam Değişkenleri) sekmesine tıklayın**

4. **Şu bilgileri ekleyin (her birini ayrı ayrı):**

   ```
   Name: NEXT_PUBLIC_FIREBASE_API_KEY
   Value: (Firebase Console'dan alacağınız API key)
   ```

   ```
   Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   Value: (Firebase Console'dan, örn: your-project.firebaseapp.com)
   ```

   ```
   Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
   Value: (Firebase Console'dan, proje ID'niz)
   ```

   ```
   Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   Value: (Firebase Console'dan, örn: your-project.appspot.com)
   ```

   ```
   Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   Value: (Firebase Console'dan)
   ```

   ```
   Name: NEXT_PUBLIC_FIREBASE_APP_ID
   Value: (Firebase Console'dan)
   ```

   ```
   Name: NEXT_PUBLIC_BACKEND_URL
   Value: (Şimdilik boş bırakın, backend'i deploy ettikten sonra ekleyeceğiz)
   ```

   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://onlinerandevum.com
   ```

5. **Her birini ekledikten sonra "Save" butonuna tıklayın**

6. **"Redeploy" (Yeniden Deploy) butonuna tıklayın**
   - (Environment variables ekledikten sonra mutlaka yeniden deploy etmelisiniz)

---

### 1.4 Domain'i Bağla

1. **Vercel dashboard'da projenize gidin**

2. **"Settings" → "Domains" sekmesine gidin**

3. **Domain adınızı yazın:**
   ```
   onlinerandevum.com
   ```

4. **"Add" butonuna tıklayın**

5. **Vercel size DNS kayıtlarını gösterecek:**
   - Örnek:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     ```
   - Veya:
     ```
     Type: CNAME
     Name: @
     Value: cname.vercel-dns.com
     ```

6. **Bu bilgileri not alın**

---

### 1.5 DNS Kayıtlarını Güncelle (Domain Sağlayıcınızda)

**Domain'i nereden aldıysanız (Turhost, Natro, GetDomain, vb.), oraya gidin:**

1. **Domain sağlayıcınızın web sitesine giriş yapın**

2. **"DNS Ayarları" veya "DNS Management" bölümüne gidin**

3. **Mevcut kayıtları silin veya Vercel'in verdiği kayıtları ekleyin:**

   **Örnek (A kaydı):**
   - Type: `A`
   - Name: `@` (veya boş bırakın)
   - Value: `76.76.21.21` (Vercel'in verdiği IP)
   - TTL: `3600` (veya otomatik)

   **Veya (CNAME kaydı):**
   - Type: `CNAME`
   - Name: `@` (veya boş bırakın)
   - Value: `cname.vercel-dns.com` (Vercel'in verdiği değer)
   - TTL: `3600` (veya otomatik)

4. **Kaydedin**

5. **Bekleyin (5 dakika - 48 saat arası sürebilir)**
   - DNS kayıtlarının yayılması zaman alır
   - [whatsmydns.net](https://www.whatsmydns.net) ile kontrol edebilirsiniz

6. **SSL sertifikası otomatik olarak aktif olacak** ✅
   - Vercel otomatik olarak HTTPS sağlar (ücretsiz)

---

## 🎯 ADIM 2: Backend'i Canlıya Al (Railway)

### 2.1 Railway Hesabı Oluştur

1. **Tarayıcınızda şu adrese gidin:**
   ```
   https://railway.app
   ```

2. **"Start a New Project" butonuna tıklayın**

3. **"Login with GitHub" seçeneğini seçin**
   - GitHub hesabınızla giriş yapın

4. **Railway hesabınız hazır!** ✅
   - $5 ücretsiz kredi veriyorlar (test için yeterli)

---

### 2.2 Backend'i Railway'e Yükleyin

1. **Railway dashboard'da "New Project" butonuna tıklayın**

2. **"Deploy from GitHub repo" seçeneğini seçin**

3. **`Berber` repo'sunu seçin**

4. **Railway otomatik olarak projeyi algılayacak**

5. **"Settings" sekmesine gidin ve şunları ayarlayın:**
   - **Root Directory:** `server` yazın
   - **Start Command:** `npm start` (otomatik olabilir)

6. **"Deploy" butonuna tıklayın**

7. **Bekleyin (2-3 dakika)**

8. **Başarılı!** ✅
   - Railway size bir URL verecek: `berber-backend.railway.app`
   - Bu URL'yi not alın

---

### 2.3 Backend URL'ini Al

1. **Railway dashboard'da projenize tıklayın**

2. **"Settings" sekmesine gidin**

3. **"Generate Domain" butonuna tıklayın**
   - Railway otomatik bir domain verecek
   - Örnek: `berber-backend.railway.app`

4. **Bu URL'yi not alın** (Vercel'deki `NEXT_PUBLIC_BACKEND_URL` için kullanacağız)

---

### 2.4 Backend Environment Variables Ekle

1. **Railway dashboard'da projenize gidin**

2. **"Variables" sekmesine tıklayın**

3. **Şu bilgileri ekleyin (her birini ayrı ayrı):**

   ```
   Name: PORT
   Value: 4000
   ```

   ```
   Name: NODE_ENV
   Value: production
   ```

   ```
   Name: FIREBASE_PROJECT_ID
   Value: (Firebase Console'dan)
   ```

   ```
   Name: FIREBASE_CLIENT_EMAIL
   Value: (Firebase Admin SDK'dan)
   ```

   ```
   Name: FIREBASE_PRIVATE_KEY
   Value: (Firebase Admin SDK'dan - tek satırda, \n karakterleriyle)
   ```

   ```
   Name: IYZICO_API_KEY
   Value: (iyzico production API key)
   ```

   ```
   Name: IYZICO_SECRET_KEY
   Value: (iyzico production secret key)
   ```

   ```
   Name: IYZICO_BASE_URL
   Value: https://api.iyzipay.com
   ```

   ```
   Name: NETGSM_USERNAME
   Value: (NetGSM kullanıcı adınız)
   ```

   ```
   Name: NETGSM_PASSWORD
   Value: (NetGSM şifreniz)
   ```

   ```
   Name: NETGSM_MSGHEADER
   Value: RANDEVUM
   ```

   ```
   Name: NETGSM_API_URL
   Value: https://api.netgsm.com.tr/sms/send/get
   ```

4. **Her birini ekledikten sonra "Add" butonuna tıklayın**

5. **Railway otomatik olarak yeniden deploy edecek**

---

### 2.5 Backend URL'ini Web Sitesine Ekle

1. **Vercel dashboard'a geri dönün**

2. **Projenize gidin → "Settings" → "Environment Variables"**

3. **`NEXT_PUBLIC_BACKEND_URL` değişkenini bulun ve güncelleyin:**
   ```
   Value: https://berber-backend.railway.app
   ```
   (Railway'den aldığınız URL'i yazın)

4. **"Save" butonuna tıklayın**

5. **"Redeploy" butonuna tıklayın**

---

## 🎯 ADIM 3: iyzico Webhook URL'ini Güncelle

1. **iyzico.com adresine gidin ve production hesabınıza giriş yapın**

2. **"Ayarlar" veya "Settings" bölümüne gidin**

3. **"Webhook URL" bölümünü bulun**

4. **Webhook URL'ini şu şekilde ayarlayın:**
   ```
   https://berber-backend.railway.app/api/webhook/iyzico/callback
   ```
   (Railway'den aldığınız backend URL'inizi kullanın)

5. **Kaydedin**

---

## 🎯 ADIM 4: Test Et

### 4.1 Web Sitesi Testleri

1. **Tarayıcınızda şu adrese gidin:**
   ```
   https://onlinerandevum.com
   ```

2. **Kontrol edin:**
   - ✅ Ana sayfa açılıyor mu?
   - ✅ Booking form çalışıyor mu?
   - ✅ Login/Register çalışıyor mu?
   - ✅ Dashboard açılıyor mu?

### 4.2 Backend Testleri

1. **Backend URL'inize gidin:**
   ```
   https://berber-backend.railway.app
   ```

2. **Eğer "Cannot GET /" gibi bir mesaj görüyorsanız, bu normaldir** (backend API endpoint'leri için)

3. **SMS gönderimi test edin:**
   - Web sitesinden bir randevu oluşturun
   - SMS gönderilip gönderilmediğini kontrol edin

### 4.3 Ödeme Testleri

1. **Test ödemesi yapın:**
   - Web sitesinden bir randevu oluşturun
   - Ödeme ekranına gidin
   - Test kartı ile ödeme yapın

2. **Webhook çalışıyor mu kontrol edin:**
   - iyzico panelinde webhook loglarını kontrol edin
   - Randevu oluşturuldu mu kontrol edin

---

## ❓ Sık Sorulan Sorular

### DNS kayıtları ne kadar sürede yayılır?
- Genellikle 5 dakika - 2 saat arası
- Bazen 24-48 saat sürebilir
- [whatsmydns.net](https://www.whatsmydns.net) ile kontrol edebilirsiniz

### SSL sertifikası ne zaman aktif olur?
- Vercel otomatik olarak SSL sağlar
- DNS kayıtları doğrulandıktan sonra 1-2 dakika içinde aktif olur

### Backend çalışmıyor, ne yapmalıyım?
1. Railway dashboard'da "Logs" sekmesine bakın
2. Environment variables'ların doğru olduğundan emin olun
3. Firebase Admin SDK private key'inin doğru formatta olduğundan emin olun

### Web sitesi açılmıyor, ne yapmalıyım?
1. Vercel dashboard'da "Deployments" sekmesine bakın
2. Son deployment'ın başarılı olup olmadığını kontrol edin
3. Environment variables'ların doğru olduğundan emin olun

---

## 📞 Yardım

Sorun yaşarsanız:
1. **Vercel/Railway logs'larını kontrol edin**
2. **Browser console'da hataları kontrol edin** (F12 → Console)
3. **Network tab'da API isteklerini kontrol edin** (F12 → Network)

---

## ✅ Başarı Kontrol Listesi

- [ ] Vercel hesabı oluşturuldu
- [ ] Web sitesi Vercel'e deploy edildi
- [ ] Environment variables eklendi
- [ ] Domain bağlandı
- [ ] DNS kayıtları güncellendi
- [ ] SSL aktif oldu
- [ ] Railway hesabı oluşturuldu
- [ ] Backend Railway'e deploy edildi
- [ ] Backend environment variables eklendi
- [ ] Backend URL web sitesine eklendi
- [ ] iyzico webhook URL'i güncellendi
- [ ] Web sitesi test edildi
- [ ] Backend test edildi
- [ ] Ödeme test edildi

**Tüm bunları tamamladığınızda, web siteniz canlıda! 🎉**

---

## 🎉 Tebrikler!

Artık web siteniz `https://onlinerandevum.com` adresinde canlıda!

Herkes internetten erişebilir ve randevu alabilir. 🚀

