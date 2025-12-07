# 🌐 Web Sitesini Vercel'e Yükleme - Adım Adım Rehber

Bu rehber, web sitenizi Vercel'e yüklemek için **her adımı** detaylı olarak açıklar.

---

## 📋 Ön Hazırlık

**İhtiyacınız olanlar:**
- ✅ GitHub hesabı (kodlarınız zaten GitHub'da)
- ✅ İnternet bağlantısı
- ✅ 15-20 dakika zaman

---

## 🎯 ADIM 1: Vercel Hesabı Oluştur

### 1.1 Vercel Web Sitesine Git

1. **Tarayıcınızı açın** (Chrome, Firefox, Safari, vb.)

2. **Adres çubuğuna şunu yazın:**
   ```
   https://vercel.com
   ```

3. **Enter'a basın**

4. **Vercel ana sayfası açılacak**

---

### 1.2 GitHub ile Giriş Yap

1. **Vercel ana sayfasında sağ üstte "Sign Up" (Kayıt Ol) butonunu görün**

2. **"Sign Up" butonuna tıklayın**

3. **Açılan ekranda "Continue with GitHub" seçeneğini görün**
   - GitHub logosu olan buton

4. **"Continue with GitHub" butonuna tıklayın**

5. **GitHub giriş ekranı açılacak:**
   - Eğer zaten GitHub'da giriş yaptıysanız, otomatik devam eder
   - Eğer giriş yapmadıysanız:
     - GitHub kullanıcı adınızı ve şifrenizi girin
     - "Sign in" butonuna tıklayın

6. **GitHub, Vercel'e erişim izni isteyecek:**
   - "Authorize Vercel" (Vercel'e İzin Ver) butonuna tıklayın
   - Bu, Vercel'in GitHub repo'larınıza erişmesine izin verir

7. **Vercel hesabınız oluşturuldu!** ✅
   - Vercel dashboard'una yönlendirileceksiniz

---

## 🎯 ADIM 2: Projeyi Vercel'e Yükle

### 2.1 Yeni Proje Oluştur

1. **Vercel dashboard'unda (ana sayfada) şunu görün:**
   - "Add New..." butonu (sağ üstte)
   - Veya "New Project" butonu

2. **"Add New..." veya "New Project" butonuna tıklayın**

3. **Açılan menüde "Project" seçeneğini seçin**

---

### 2.2 GitHub Repo'yu Seç

1. **Açılan ekranda GitHub repo'larınızı göreceksiniz**

2. **`Berber` projesini bulun**
   - Repo adı: `Berber` (veya GitHub'da ne adla kaydettiyseniz)
   - Repo açıklaması: "Randevum App & Website"

3. **`Berber` repo'sunun yanında "Import" butonunu görün**

4. **"Import" butonuna tıklayın**

---

### 2.3 Proje Ayarlarını Yap

**ÖNEMLİ:** Bu adım çok önemli! Yanlış ayar yaparsanız proje çalışmaz.

1. **"Configure Project" (Projeyi Yapılandır) ekranı açılacak**

2. **"Project Name" (Proje Adı) bölümü:**
   - Otomatik olarak `berber` yazacak
   - İsterseniz değiştirebilirsiniz (örn: `randevum-web`)
   - **Değiştirmenize gerek yok, olduğu gibi bırakın**

3. **"Root Directory" (Kök Dizin) bölümü:**
   - **ÇOK ÖNEMLİ!** Buraya `web` yazmanız gerekiyor
   - Vercel'e `web` klasöründeki dosyaları kullanmasını söyler
   - Şu anda muhtemelen boş veya `.` yazıyor
   - **Tıklayın ve `web` yazın**

4. **"Framework Preset" (Framework Ön Ayarı) bölümü:**
   - Otomatik olarak "Next.js" seçilecek
   - **Değiştirmeyin, olduğu gibi bırakın**

5. **"Build Command" (Derleme Komutu) bölümü:**
   - Otomatik olarak `npm run build` yazacak
   - **Değiştirmeyin, olduğu gibi bırakın**

6. **"Output Directory" (Çıktı Dizini) bölümü:**
   - Otomatik olarak `.next` yazacak
   - **Değiştirmeyin, olduğu gibi bırakın**

7. **"Install Command" (Kurulum Komutu) bölümü:**
   - Otomatik olarak `npm install` yazacak
   - **Değiştirmeyin, olduğu gibi bırakın**

---

### 2.4 Environment Variables (Şimdilik Atla)

**Not:** Environment variables'ları şimdilik eklemeyin. Önce projeyi deploy edelim, sonra ekleyeceğiz.

1. **"Environment Variables" bölümünü görmezden gelin**
   - Şimdilik boş bırakın
   - Sonra ekleyeceğiz

---

### 2.5 Deploy Et

1. **Ekranın altında "Deploy" (Yükle) butonunu görün**

2. **"Deploy" butonuna tıklayın**

3. **Vercel şimdi projeyi yüklemeye başlayacak:**
   - "Building" (Derleniyor) yazısını göreceksiniz
   - Bu işlem 2-5 dakika sürebilir

4. **Bekleyin:**
   - Vercel otomatik olarak:
     - Kodlarınızı GitHub'dan çeker
     - `web` klasörüne gider
     - `npm install` çalıştırır (bağımlılıkları kurar)
     - `npm run build` çalıştırır (projeyi derler)
     - Canlıya alır

5. **İşlem sırasında:**
   - Ekranda log'lar göreceksiniz
   - "Installing dependencies..." (Bağımlılıklar kuruluyor...)
   - "Building..." (Derleniyor...)
   - "Deploying..." (Yükleniyor...)

---

### 2.6 Başarılı Deploy

1. **İşlem tamamlandığında:**
   - Yeşil bir "Success" (Başarılı) mesajı göreceksiniz
   - Veya "Ready" (Hazır) yazısı

2. **Size bir URL verilecek:**
   - Örnek: `berber-xyz123.vercel.app`
   - Bu geçici bir URL'dir
   - Sonra domain'inizi (`onlinerandevum.com`) bağlayacağız

3. **Bu URL'yi not alın:**
   - Bir yere yazın (sonra kullanacağız)

4. **"Visit" (Ziyaret Et) butonuna tıklayın:**
   - Web siteniz açılacak!
   - Şu anda bazı özellikler çalışmayabilir (environment variables eksik)

---

## 🎯 ADIM 3: Environment Variables Ekle

**Ne demek?** Firebase, backend URL gibi gizli bilgileri Vercel'e söylememiz gerekiyor.

### 3.1 Environment Variables Sayfasına Git

1. **Vercel dashboard'unda projenize tıklayın**
   - Proje adına tıklayın (örn: `berber`)

2. **Üst menüde "Settings" (Ayarlar) sekmesine tıklayın**

3. **Sol menüde "Environment Variables" (Ortam Değişkenleri) seçeneğine tıklayın**

---

### 3.2 Firebase Bilgilerini Ekle

**Firebase Console'dan bilgileri almanız gerekiyor:**

1. **Firebase Console'a gidin:**
   ```
   https://console.firebase.google.com
   ```

2. **Projenizi seçin**

3. **⚙️ (Ayarlar) ikonuna tıklayın → "Project settings"**

4. **"Your apps" bölümünde web uygulamanızı bulun (veya yeni oluşturun)**

5. **"SDK setup and configuration" bölümünde şu bilgileri göreceksiniz:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

**Şimdi Vercel'e ekleyin:**

1. **Vercel'de "Environment Variables" sayfasında:**

2. **"Add New" butonuna tıklayın**

3. **İlk değişkeni ekleyin:**
   - **Key (Anahtar):** `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Value (Değer):** Firebase'den aldığınız `apiKey` değerini yapıştırın
   - **Environment:** "Production" seçin (veya "All" seçin)
   - **"Save" butonuna tıklayın**

4. **İkinci değişkeni ekleyin:**
   - **Key:** `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - **Value:** Firebase'den aldığınız `authDomain` değerini yapıştırın
   - **Environment:** "Production" (veya "All")
   - **"Save" butonuna tıklayın**

5. **Üçüncü değişkeni ekleyin:**
   - **Key:** `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - **Value:** Firebase'den aldığınız `projectId` değerini yapıştırın
   - **Environment:** "Production" (veya "All")
   - **"Save" butonuna tıklayın**

6. **Dördüncü değişkeni ekleyin:**
   - **Key:** `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - **Value:** Firebase'den aldığınız `storageBucket` değerini yapıştırın
   - **Environment:** "Production" (veya "All")
   - **"Save" butonuna tıklayın**

7. **Beşinci değişkeni ekleyin:**
   - **Key:** `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - **Value:** Firebase'den aldığınız `messagingSenderId` değerini yapıştırın
   - **Environment:** "Production" (veya "All")
   - **"Save" butonuna tıklayın**

8. **Altıncı değişkeni ekleyin:**
   - **Key:** `NEXT_PUBLIC_FIREBASE_APP_ID`
   - **Value:** Firebase'den aldığınız `appId` değerini yapıştırın
   - **Environment:** "Production" (veya "All")
   - **"Save" butonuna tıklayın**

---

### 3.3 Site URL Ekle

1. **"Add New" butonuna tıklayın**

2. **Key:** `NEXT_PUBLIC_SITE_URL`
3. **Value:** `https://onlinerandevum.com`
4. **Environment:** "Production" (veya "All")
5. **"Save" butonuna tıklayın**

---

### 3.4 Backend URL (Şimdilik Boş Bırak)

**Not:** Backend URL'ini şimdilik eklemeyin. Backend'i deploy ettikten sonra ekleyeceğiz.

1. **Şimdilik bu değişkeni eklemeyin**
2. **Backend'i Railway'e deploy ettikten sonra ekleyeceğiz**

---

### 3.5 Yeniden Deploy Et

**ÖNEMLİ:** Environment variables ekledikten sonra mutlaka yeniden deploy etmelisiniz!

1. **Vercel dashboard'unda projenize gidin**

2. **"Deployments" (Yüklemeler) sekmesine tıklayın**

3. **En üstteki deployment'ın yanında üç nokta (⋯) menüsünü görün**

4. **Üç noktaya tıklayın → "Redeploy" (Yeniden Yükle) seçin**

5. **"Redeploy" butonuna tıklayın**

6. **2-3 dakika bekleyin**

7. **Deploy tamamlandığında web siteniz artık Firebase ile çalışacak!** ✅

---

## 🎯 ADIM 4: Domain'i Bağla

### 4.1 Domain Ekle

1. **Vercel dashboard'unda projenize gidin**

2. **"Settings" (Ayarlar) sekmesine tıklayın**

3. **Sol menüde "Domains" (Alan Adları) seçeneğine tıklayın**

4. **"Add Domain" (Alan Adı Ekle) butonuna tıklayın**

5. **Domain adınızı yazın:**
   ```
   onlinerandevum.com
   ```

6. **"Add" (Ekle) butonuna tıklayın**

---

### 4.2 DNS Kayıtlarını Al

1. **Vercel size DNS kayıtlarını gösterecek**

2. **İki seçenek göreceksiniz:**

   **Seçenek 1: A Kaydı**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
   (IP adresi farklı olabilir, Vercel'in verdiğini kullanın)

   **Seçenek 2: CNAME Kaydı**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

3. **Bu bilgileri not alın:**
   - Type (Tip)
   - Name (İsim)
   - Value (Değer)

---

### 4.3 DNS Kayıtlarını Domain Sağlayıcınızda Güncelle

**Domain'i nereden aldıysanız (Turhost, Natro, GetDomain, vb.), oraya gidin:**

1. **Domain sağlayıcınızın web sitesine giriş yapın**

2. **"DNS Ayarları" veya "DNS Management" veya "Name Servers" bölümüne gidin**

3. **Mevcut DNS kayıtlarını bulun**

4. **Vercel'in verdiği kaydı ekleyin veya güncelleyin:**

   **Eğer A kaydı kullanıyorsanız:**
   - Type: `A`
   - Name: `@` (veya boş bırakın, root domain için)
   - Value: Vercel'in verdiği IP adresi (örn: `76.76.21.21`)
   - TTL: `3600` (veya otomatik)

   **Eğer CNAME kaydı kullanıyorsanız:**
   - Type: `CNAME`
   - Name: `@` (veya boş bırakın)
   - Value: Vercel'in verdiği CNAME değeri (örn: `cname.vercel-dns.com`)
   - TTL: `3600` (veya otomatik)

5. **Kaydedin**

6. **Bekleyin:**
   - DNS kayıtlarının yayılması 5 dakika - 48 saat sürebilir
   - Genellikle 10-30 dakika içinde çalışır

---

### 4.4 SSL Sertifikası (Otomatik)

1. **Vercel otomatik olarak SSL sertifikası sağlar**
2. **DNS kayıtları doğrulandıktan sonra 1-2 dakika içinde aktif olur**
3. **Hiçbir şey yapmanıza gerek yok!** ✅

---

### 4.5 Domain'in Çalışıp Çalışmadığını Kontrol Et

1. **Birkaç dakika bekleyin (DNS yayılması için)**

2. **Tarayıcınızda şu adrese gidin:**
   ```
   https://onlinerandevum.com
   ```

3. **Web siteniz açılıyorsa başarılı!** ✅

4. **Eğer açılmıyorsa:**
   - [whatsmydns.net](https://www.whatsmydns.net) adresine gidin
   - Domain'inizi yazın: `onlinerandevum.com`
   - DNS kayıtlarının yayılıp yayılmadığını kontrol edin
   - Henüz yayılmadıysa, biraz daha bekleyin

---

## ✅ Tamamlandı!

**Web siteniz artık canlıda!** 🎉

- ✅ Vercel'e yüklendi
- ✅ Environment variables eklendi
- ✅ Domain bağlandı
- ✅ SSL aktif

**Sonraki adım:** Backend'i Railway'e yüklemek (başka bir rehber)

---

## ❓ Sorun Giderme

### Deploy başarısız oldu

1. **Vercel dashboard'unda "Deployments" sekmesine gidin**
2. **Başarısız deployment'a tıklayın**
3. **"Logs" sekmesine bakın**
4. **Hata mesajını okuyun**
5. **Genellikle şu hatalar olur:**
   - `Root Directory` yanlış (mutlaka `web` olmalı)
   - `package.json` bulunamadı (Root Directory yanlış)
   - Build hatası (kod hatası olabilir)

### Web sitesi açılmıyor

1. **Vercel dashboard'unda "Deployments" sekmesine bakın**
2. **Son deployment'ın başarılı olup olmadığını kontrol edin**
3. **Eğer başarısızsa, yukarıdaki adımları takip edin**

### Domain çalışmıyor

1. **DNS kayıtlarının doğru olduğundan emin olun**
2. **[whatsmydns.net](https://www.whatsmydns.net) ile kontrol edin**
3. **24-48 saat bekleyin (bazen bu kadar sürebilir)**

---

## 📞 Yardım

Sorun yaşarsanız:
1. Vercel dashboard'unda "Logs" sekmesine bakın
2. Browser console'da hataları kontrol edin (F12 → Console)
3. Vercel support'a başvurun

---

**Başarılar! 🚀**

