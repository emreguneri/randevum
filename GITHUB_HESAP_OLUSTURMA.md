# 🔵 GitHub Hesabı Oluşturma ve Kodları Yükleme Rehberi

GitHub hesabınız yoksa, önce hesap oluşturup kodlarınızı GitHub'a yüklemeniz gerekiyor.

---

## 🎯 ADIM 1: GitHub Hesabı Oluştur

### 1.1 GitHub Web Sitesine Git

1. **Tarayıcınızı açın**

2. **Adres çubuğuna şunu yazın:**
   ```
   https://github.com
   ```

3. **Enter'a basın**

---

### 1.2 Hesap Oluştur

1. **GitHub ana sayfasında sağ üstte "Sign up" (Kayıt Ol) butonunu görün**

2. **"Sign up" butonuna tıklayın**

3. **Kayıt formunu doldurun:**
   - **Username (Kullanıcı Adı):** 
     - Örnek: `emreguneri` veya `randevum-app`
     - Sadece harf, rakam ve tire (-) kullanabilirsiniz
     - Boşluk kullanamazsınız
   
   - **Email (E-posta):**
     - Email adresinizi yazın
     - Doğrulama email'i gönderilecek
   
   - **Password (Şifre):**
     - Güçlü bir şifre oluşturun
     - En az 8 karakter olmalı
     - Harf, rakam ve özel karakter içermeli

4. **"Create account" (Hesap Oluştur) butonuna tıklayın**

5. **Email doğrulama:**
   - Email'inize gelen doğrulama linkine tıklayın
   - Veya GitHub'ın verdiği kodu girin

6. **Hesap oluşturuldu!** ✅

---

## 🎯 ADIM 2: Yeni Repository (Repo) Oluştur

### 2.1 Yeni Repo Oluştur

1. **GitHub'da giriş yaptıktan sonra sağ üstte "+" (artı) ikonunu görün**

2. **"+" ikonuna tıklayın → "New repository" (Yeni Depo) seçin**

3. **Repository bilgilerini doldurun:**
   - **Repository name (Depo Adı):** `Berber` (veya istediğiniz bir isim)
   - **Description (Açıklama):** "Randevum App & Website" (isteğe bağlı)
   - **Public / Private:**
     - **Public** seçin (ücretsiz, Vercel ile entegrasyon kolay)
     - Veya **Private** seçin (ücretli, ama kodlarınız gizli kalır)

4. **"Initialize this repository with:" bölümünü işaretlemeyin:**
   - ❌ "Add a README file" işaretlemeyin
   - ❌ "Add .gitignore" işaretlemeyin
   - ❌ "Choose a license" seçmeyin
   - (Kodlarınız zaten var, boş repo oluşturuyoruz)

5. **"Create repository" (Depo Oluştur) butonuna tıklayın**

6. **Yeni repo oluşturuldu!** ✅
   - Şu anda boş bir repo
   - Şimdi kodlarınızı yükleyeceğiz

---

## 🎯 ADIM 3: Kodları GitHub'a Yükle

### 3.1 Terminal'i Açın

**Mac için:**
1. **Spotlight'ı açın:** `Cmd + Space` tuşlarına basın
2. **"Terminal" yazın**
3. **Enter'a basın**

**Windows için:**
1. **Başlat menüsünde "Command Prompt" veya "PowerShell" arayın**
2. **Açın**

---

### 3.2 Proje Klasörüne Gidin

**Terminal'de şu komutu yazın:**
```bash
cd /Users/emreguneri/Berber
```

**Enter'a basın**

---

### 3.3 Git'i Başlat (İlk Kez)

**Eğer daha önce Git kullanmadıysanız:**

1. **Git'in kurulu olup olmadığını kontrol edin:**
   ```bash
   git --version
   ```
   - Eğer bir versiyon numarası görürseniz → Git kurulu ✅
   - Eğer "command not found" görürseniz → Git kurmanız gerekiyor

2. **Git kurulu değilse:**
   - **Mac:** [git-scm.com](https://git-scm.com/download/mac) adresinden indirin
   - Veya Terminal'de: `xcode-select --install` yazın

---

### 3.4 Git Repository'sini Başlat

**Terminal'de şu komutları sırayla yazın:**

```bash
git init
```

**Enter'a basın**

```bash
git add .
```

**Enter'a basın** (tüm dosyaları ekler)

```bash
git commit -m "Initial commit"
```

**Enter'a basın** (dosyaları commit eder)

---

### 3.5 GitHub Repo'suna Bağla

1. **GitHub'da oluşturduğunuz repo'ya gidin**
   - Örnek: `https://github.com/kullanici-adi/Berber`

2. **Yeşil "Code" butonuna tıklayın**

3. **HTTPS seçeneğini seçin**

4. **URL'yi kopyalayın:**
   - Örnek: `https://github.com/kullanici-adi/Berber.git`

5. **Terminal'de şu komutu yazın (URL'yi kendi URL'nizle değiştirin):**
   ```bash
   git remote add origin https://github.com/kullanici-adi/Berber.git
   ```

6. **Enter'a basın**

---

### 3.6 Kodları GitHub'a Yükle

**Terminal'de şu komutu yazın:**

```bash
git push -u origin main
```

**Enter'a basın**

**Eğer "main" yerine "master" kullanıyorsanız:**
```bash
git push -u origin master
```

**Enter'a basın**

7. **GitHub kullanıcı adı ve şifrenizi isteyecek:**
   - Kullanıcı adınızı girin
   - Şifrenizi girin (şifre görünmez, normal)
   - Enter'a basın

8. **Kodlar yükleniyor...** (birkaç dakika sürebilir)

9. **"Done" veya benzer bir mesaj görürseniz başarılı!** ✅

---

### 3.7 Kontrol Et

1. **GitHub'da repo'nuzu yenileyin**
2. **Dosyalarınızı görmelisiniz:**
   - `app/` klasörü
   - `web/` klasörü
   - `server/` klasörü
   - `package.json`
   - vb.

3. **Eğer dosyalar görünüyorsa → Başarılı!** ✅

---

## 🎯 ADIM 4: Vercel'e Geri Dön

**Artık GitHub hesabınız ve repo'nuz hazır!**

1. **Vercel'e geri dönün**

2. **"Continue with GitHub" butonuna tıklayın**

3. **GitHub hesabınızla giriş yapın**

4. **Vercel, GitHub repo'larınızı görecek**

5. **`Berber` repo'sunu seçin ve devam edin**

---

## ❓ Sorun Giderme

### Git kurulu değil

**Mac:**
```bash
xcode-select --install
```

**Veya:**
- [git-scm.com](https://git-scm.com/download/mac) adresinden indirin

**Windows:**
- [git-scm.com](https://git-scm.com/download/win) adresinden indirin

---

### "git: command not found" hatası

- Git kurulu değil
- Yukarıdaki adımları takip edin

---

### "Permission denied" hatası

- GitHub kullanıcı adı veya şifreniz yanlış
- Tekrar deneyin
- Şifre yerine Personal Access Token kullanmanız gerekebilir

---

### Kodlar yüklenmiyor

1. **İnternet bağlantınızı kontrol edin**
2. **GitHub'da repo'nun oluşturulduğundan emin olun**
3. **URL'nin doğru olduğundan emin olun**

---

## ✅ Tamamlandı!

**Artık:**
- ✅ GitHub hesabınız var
- ✅ Kodlarınız GitHub'da
- ✅ Vercel'e devam edebilirsiniz!

**Sonraki adım:** Vercel'de "Continue with GitHub" ile giriş yapın ve projeyi deploy edin.

---

**Başarılar! 🚀**

