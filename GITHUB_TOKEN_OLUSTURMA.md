# 🔑 GitHub Personal Access Token Oluşturma

Terminal'den otomatik push yapmak için Personal Access Token oluşturmanız gerekiyor.

---

## 🎯 ADIM 1: Token Oluştur

1. **GitHub'da sağ üstte profil ikonunuza tıklayın**

2. **"Settings" (Ayarlar) seçeneğine tıklayın**

3. **Sol menüde en altta "Developer settings" seçeneğine tıklayın**

4. **"Personal access tokens" → "Tokens (classic)" seçeneğine tıklayın**

5. **"Generate new token" → "Generate new token (classic)" butonuna tıklayın**

6. **Token ayarlarını yapın:**
   - **Note (Not):** `Vercel Deployment` yazın
   - **Expiration (Süre):** `90 days` seçin (veya istediğiniz süre)
   - **Scopes (İzinler):** 
     - ✅ **`repo`** işaretleyin (tüm repo izinleri)
     - Bu yeterli

7. **En altta "Generate token" (Token Oluştur) butonuna tıklayın**

8. **ÖNEMLİ:** Token'ı hemen kopyalayın!
   - Token bir daha gösterilmeyecek
   - Bir yere not alın

---

## 🎯 ADIM 2: Token ile Push Yap

**Token'ı aldıktan sonra bana söyleyin, ben push komutunu çalıştıracağım.**

Veya Terminal'de kendiniz yapabilirsiniz:

```bash
cd /Users/emreguneri/Berber
git push -u origin main
```

**Username:** `emreguneri`  
**Password:** **Token'ı yapıştırın** (şifre değil!)

---

## ✅ Alternatif: GitHub Desktop Kullan

Eğer token oluşturmak istemiyorsanız:

1. **GitHub Desktop uygulamasını indirin:**
   - [desktop.github.com](https://desktop.github.com)

2. **GitHub Desktop ile:**
   - "File" → "Add Local Repository"
   - `/Users/emreguneri/Berber` klasörünü seçin
   - "Publish repository" butonuna tıklayın
   - Otomatik olarak push eder

---

**Token'ı oluşturduktan sonra bana söyleyin!** 🚀

