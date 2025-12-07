# App Store Connect Hesabı Kontrol Rehberi

## 1. Apple Developer Program Üyeliği

### Kontrol Adımları:
1. **Apple Developer hesabınız var mı?**
   - https://developer.apple.com adresine gidin
   - Apple ID ile giriş yapın
   - "Account" (Hesap) sayfasına gidin
   - Üyelik durumunuzu kontrol edin

### Gerekli Bilgiler:
- ✅ **Apple Developer Program üyeliği** ($99/yıl)
- ✅ **Aktif üyelik** (süresi dolmamış olmalı)
- ✅ **Team ID**: `K82STGG37K` (eas.json'da mevcut)

### Üyelik Yoksa:
1. https://developer.apple.com/programs/ adresine gidin
2. "Enroll" (Kayıt Ol) butonuna tıklayın
3. Apple ID ile giriş yapın
4. Kişisel veya kurumsal hesap seçin
5. Ödeme yapın ($99/yıl)
6. Onay süreci 24-48 saat sürebilir

---

## 2. App Store Connect Erişimi

### Kontrol Adımları:
1. **App Store Connect'e giriş yapın**
   - https://appstoreconnect.apple.com adresine gidin
   - Apple ID ile giriş yapın
   - "My Apps" (Uygulamalarım) sayfasına gidin

### Gerekli Erişim:
- ✅ **App Store Connect'e erişim** (Developer Program üyeliği ile otomatik)
- ✅ **Yeni uygulama oluşturma yetkisi**
- ✅ **Metadata düzenleme yetkisi**

### Erişim Yoksa:
- Apple Developer Program üyeliği gerekli
- Üyelik onaylandıktan sonra otomatik erişim sağlanır

---

## 3. Bundle ID Kontrolü

### Mevcut Bundle ID:
- **Bundle ID**: `com.happyhour.randevum`
- **app.json'da tanımlı**: ✅
- **eas.json'da Team ID**: `K82STGG37K`

### Kontrol Adımları:
1. **Apple Developer Portal'a gidin**
   - https://developer.apple.com/account/resources/identifiers/list
   - "Identifiers" (Tanımlayıcılar) sayfasına gidin
   - `com.happyhour.randevum` bundle ID'sini arayın

### Bundle ID Yoksa:
1. "Identifiers" sayfasına gidin
2. "+" (Yeni) butonuna tıklayın
3. "App IDs" seçin
4. "App" seçin
5. Bundle ID'yi girin: `com.happyhour.randevum`
6. Capabilities (özellikler) seçin:
   - Push Notifications (opsiyonel)
   - Associated Domains (opsiyonel)
7. "Continue" → "Register" → "Done"

---

## 4. Sertifika ve Profil Kontrolü

### Gerekli Sertifikalar:
- ✅ **Distribution Certificate** (App Store için)
- ✅ **Provisioning Profile** (App Store için)

### EAS Build Kullanıyorsanız:
- EAS otomatik olarak sertifikaları yönetir
- Manuel oluşturmanıza gerek yok
- İlk build'de otomatik oluşturulur

### Kontrol:
- EAS build yaparken otomatik kontrol edilir
- Hata varsa build sırasında bildirilir

---

## 5. Test Kullanıcı Hesapları (Opsiyonel)

### App Store Review için:
- Test hesabı gerekli olabilir (uygulama özelliklerine göre)
- E-posta ve şifre hazırlayın
- App Store Connect'te "App Information" → "App Review Information" bölümüne ekleyin

---

## Kontrol Listesi

### ✅ Yapılması Gerekenler:
- [ ] Apple Developer Program üyeliği var mı? ($99/yıl)
- [ ] App Store Connect'e erişim var mı?
- [ ] Bundle ID oluşturuldu mu? (`com.happyhour.randevum`)
- [ ] Team ID doğru mu? (`K82STGG37K`)
- [ ] EAS CLI kurulu mu? (`eas --version`)

### 📝 Notlar:
- EAS Build kullanıyorsanız, sertifikalar otomatik yönetilir
- İlk build'de EAS, gerekli sertifikaları oluşturur
- Bundle ID yoksa, EAS build sırasında oluşturulabilir (otomatik)

---

## Sonraki Adımlar

1. **Apple Developer Program üyeliğinizi kontrol edin**
2. **App Store Connect'e giriş yapın**
3. **Bundle ID'yi kontrol edin veya oluşturun**
4. **EAS CLI ile giriş yapın**: `eas login`

---

## Yardımcı Linkler

- Apple Developer: https://developer.apple.com
- App Store Connect: https://appstoreconnect.apple.com
- EAS Build Docs: https://docs.expo.dev/build/introduction/

