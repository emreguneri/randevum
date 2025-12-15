# 📤 GitHub'a Kodları Yükleme

Kodlarınız hazır! Şimdi GitHub'a yüklemek için Terminal'de şu komutu çalıştırın:

## 🎯 Komut

Terminal'i açın ve şu komutu yazın:

```bash
cd /Users/emreguneri/Berber && git push -u origin main
```

**Enter'a basın**

---

## 🔐 Giriş Bilgileri İstenecek

1. **Username (Kullanıcı Adı):**
   - `emreguneri` yazın
   - Enter'a basın

2. **Password (Şifre):**
   - GitHub şifrenizi yazın
   - **Not:** Şifre görünmez (normal)
   - Enter'a basın

---

## ✅ Başarılı Olursa

- "Enumerating objects..." mesajını göreceksiniz
- "Writing objects..." mesajını göreceksiniz
- "To https://github.com/emreguneri/randevum.git" mesajını göreceksiniz
- **Başarılı!** ✅

---

## ❌ Hata Alırsanız

### "Authentication failed" hatası

**Çözüm:** Personal Access Token kullanın:

1. **GitHub'da:**
   - Sağ üstte profil ikonunuza tıklayın
   - "Settings" → "Developer settings" → "Personal access tokens" → "Tokens (classic)"
   - "Generate new token" → "Generate new token (classic)"
   - Note: "Vercel" yazın
   - Expiration: 90 days (veya istediğiniz süre)
   - Scopes: "repo" işaretleyin
   - "Generate token" butonuna tıklayın
   - **Token'ı kopyalayın** (bir daha gösterilmeyecek!)

2. **Terminal'de:**
   - `git push -u origin main` komutunu tekrar çalıştırın
   - Username: `emreguneri`
   - Password: **Token'ı yapıştırın** (şifre değil!)

---

## 🎉 Başarılı Olduktan Sonra

1. **GitHub'da repo'nuzu yenileyin:**
   ```
   https://github.com/emreguneri/randevum
   ```

2. **Dosyalarınızı görmelisiniz:**
   - `app/` klasörü
   - `web/` klasörü
   - `server/` klasörü
   - Tüm dosyalar

3. **Artık Vercel'e devam edebilirsiniz!** 🚀

---

**Başarılar!**

