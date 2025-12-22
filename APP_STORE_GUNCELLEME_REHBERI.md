# App Store Güncelleme Rehberi

Bu rehber, Randevum uygulamasını App Store'da güncellemek için gereken tüm adımları içerir.

## 📋 Ön Hazırlık

### 1. Build Number Güncellemesi
✅ Build number `app.json` dosyasında `9`'dan `10`'a güncellendi.

### 2. Değişiklikleri Kontrol Et
- Tüm değişiklikler commit edildi mi?
- Test edildi mi?
- Yeni özellikler dokümante edildi mi?

## 🚀 Adım Adım Güncelleme Süreci

### Adım 1: EAS Build ile Production Build Oluştur

1. **Terminal'de proje dizinine gidin:**
   ```bash
   cd /Users/emreguneri/Berber
   ```

2. **EAS CLI'yi yükleyin (eğer yüklü değilse):**
   ```bash
   npm install -g eas-cli
   ```

3. **EAS'a giriş yapın:**
   ```bash
   eas login
   ```

4. **Production build oluşturun:**
   ```bash
   eas build --platform ios --profile production
   ```

   **Not:** Bu işlem 15-30 dakika sürebilir. Build tamamlandığında size bir link gönderilecek.

### Adım 2: Build'i İndirin

1. Build tamamlandığında, terminal'de veya email'de bir link alacaksınız.
2. Link'e tıklayın ve `.ipa` dosyasını indirin.
3. İndirilen dosyayı kolay erişilebilir bir yere kaydedin (örneğin Desktop).

### Adım 3: Transporter ile App Store Connect'e Yükleyin

1. **Mac App Store'dan Transporter'ı indirin** (eğer yüklü değilse):
   - Mac App Store'u açın
   - "Transporter" araması yapın
   - Apple'ın resmi uygulamasını indirin

2. **Transporter'ı açın:**
   - İndirdiğiniz `.ipa` dosyasını Transporter penceresine sürükleyin
   - Veya "Deliver Your App" butonuna tıklayıp dosyayı seçin

3. **Apple ID ile giriş yapın:**
   - App Store Connect hesabınızla giriş yapın
   - İki faktörlü doğrulama gerekebilir

4. **Yüklemeyi başlatın:**
   - "Deliver" butonuna tıklayın
   - Yükleme tamamlanana kadar bekleyin (5-15 dakika)

### Adım 4: App Store Connect'te Versiyonu Yapılandırın

1. **App Store Connect'e giriş yapın:**
   - https://appstoreconnect.apple.com adresine gidin
   - Apple ID ile giriş yapın

2. **Uygulamanızı seçin:**
   - "My Apps" bölümünden "Randevum" uygulamasını seçin

3. **Yeni versiyon oluşturun:**
   - "+ Version or Platform" butonuna tıklayın
   - Yeni versiyon numarası girin (örneğin: 1.0.1 veya 1.1.0)
   - "Create" butonuna tıklayın

4. **Build'i seçin:**
   - "Build" bölümünden yeni yüklediğiniz build'i seçin
   - Build görünmüyorsa birkaç dakika bekleyin (işleme alınması gerekir)

5. **Güncelleme Notlarını Doldurun:**
   - "What's New in This Version" bölümüne güncelleme notlarını yazın:
   
   **Örnek:**
   ```
   🎉 Yeni Özellikler:
   - Müşteriler artık 1, 3, 6 veya 12 aylık abonelik seçebilir
   - Uzun süreli aboneliklerde özel indirimler
   - Abonelik uzatma özelliği eklendi
   - Performans iyileştirmeleri
   - Hata düzeltmeleri
   ```

6. **Ekran Görüntüleri (Gerekirse):**
   - Eğer ekran görüntüleri değiştiyse, yeni ekran görüntülerini yükleyin
   - Mevcut ekran görüntüleri aynıysa, bu adımı atlayabilirsiniz

7. **Gizlilik ve Uyumluluk:**
   - "Privacy" bölümünü kontrol edin
   - Gerekirse güncelleyin

8. **Yaş Sınırı:**
   - "Age Rating" bölümünü kontrol edin
   - Gerekirse güncelleyin

### Adım 5: İnceleme için Gönderin

1. **Tüm bilgileri kontrol edin:**
   - Versiyon numarası doğru mu?
   - Build seçildi mi?
   - Güncelleme notları yazıldı mı?
   - Ekran görüntüleri güncel mi?

2. **"Submit for Review" butonuna tıklayın:**
   - Son bir kontrol ekranı açılacak
   - "Submit" butonuna tıklayın

3. **Onay mesajı:**
   - "Your app has been submitted for review" mesajını göreceksiniz
   - İnceleme süreci genellikle 24-48 saat sürer

## ⏱️ İnceleme Süreci

- **Bekleme Süresi:** Genellikle 24-48 saat
- **Durum Takibi:** App Store Connect'te "App Review" bölümünden takip edebilirsiniz
- **Onaylandığında:** Email alacaksınız ve uygulama otomatik olarak yayınlanacak (veya manuel yayınlama seçeneği varsa onu seçebilirsiniz)

## 🔍 Olası Sorunlar ve Çözümleri

### Build Oluşturulurken Hata
- **Sorun:** EAS build başarısız oluyor
- **Çözüm:** 
  - `eas.json` dosyasını kontrol edin
  - Environment variables doğru mu kontrol edin
  - EAS CLI'nin güncel versiyonunu kullanın: `npm install -g eas-cli@latest`

### Transporter'da Yükleme Hatası
- **Sorun:** IPA dosyası yüklenmiyor
- **Çözüm:**
  - İnternet bağlantınızı kontrol edin
  - Apple ID'nizin App Store Connect erişimi olduğundan emin olun
  - IPA dosyasının bozuk olmadığından emin olun

### App Store Connect'te Build Görünmüyor
- **Sorun:** Yüklediğiniz build listede görünmüyor
- **Çözüm:**
  - Birkaç dakika bekleyin (işleme alınması gerekir)
  - "Processing" durumunda olabilir
  - Eğer 1 saatten fazla beklediyse, build'i tekrar yüklemeyi deneyin

### İnceleme Reddedildi
- **Sorun:** Apple uygulamayı reddetti
- **Çözüm:**
  - App Store Connect'te reddetme nedenini okuyun
  - Gerekli düzeltmeleri yapın
  - Yeni bir build oluşturup tekrar gönderin

## 📝 Notlar

- Her güncelleme için build number'ı artırmayı unutmayın
- Güncelleme notlarını kullanıcı dostu ve anlaşılır yazın
- Önemli değişiklikleri vurgulayın
- Test sürecini atlamayın

## 🎯 Hızlı Komutlar

```bash
# Build number'ı artır (app.json'da manuel)
# Sonra:

# EAS'a giriş
eas login

# Production build oluştur
eas build --platform ios --profile production

# Build durumunu kontrol et
eas build:list
```

## 📞 Destek

Sorun yaşarsanız:
- EAS Dokümantasyonu: https://docs.expo.dev/build/introduction/
- App Store Connect Yardım: https://help.apple.com/app-store-connect/

---

**Son Güncelleme:** Build 10 - Abonelik süresi seçimi özelliği eklendi

