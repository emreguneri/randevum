# TestFlight Manuel Yükleme Rehberi

## ADIM 1: .ipa Dosyasını İndirme

### Terminal'de çalıştırın:
```bash
cd ~/Downloads
curl -O https://expo.dev/artifacts/eas/cZr98zdLbUpUVuhtddpFuW.ipa
```

**NOT:** Eğer dosya indirilmezse veya çok küçükse, tarayıcıdan direkt linke tıklayarak da indirebilirsiniz:
https://expo.dev/artifacts/eas/cZr98zdLbUpUVuhtddpFuW.ipa

---

## ADIM 2: Transporter Uygulamasını İndirme

1. **Mac App Store'u açın**
2. **"Transporter"** araması yapın
3. **Apple tarafından yapılmış olan Transporter uygulamasını** bulun
4. **"Get" veya "İndir"** butonuna tıklayın
5. Uygulama indirilip yüklenecek

**Alternatif:** Eğer App Store'dan bulamazsanız:
- https://apps.apple.com/us/app/transporter/id1450874784 adresinden indirin

---

## ADIM 3: Transporter ile .ipa Dosyasını Yükleme

1. **Transporter uygulamasını açın**
2. **Apple ID'niz ile giriş yapın** (eemmrree.10@icloud.com)
3. **Downloads klasörünüze gidin** (Finder'da)
4. **cZr98zdLbUpUVuhtddpFuW.ipa** dosyasını bulun
5. **Dosyayı Transporter penceresine sürükleyip bırakın**
6. **"Deliver"** butonuna tıklayın
7. Yükleme başlayacak (birkaç dakika sürebilir)

---

## ADIM 4: App Store Connect'te Kontrol

1. **App Store Connect'e gidin:**
   https://appstoreconnect.apple.com

2. **"My Apps"** sekmesine tıklayın

3. **"Randevum" uygulamanızı seçin**
   - Eğer uygulama yoksa:
     - "+" butonuna tıklayın
     - "New App" seçin
     - Formu doldurun:
       - Name: Randevum
       - Primary Language: Turkish
       - Bundle ID: com.happyhour.randevum
       - SKU: randevum-001

4. **Sol menüden "TestFlight" sekmesine tıklayın**

5. **"iOS Builds" bölümünde build'inizi göreceksiniz**
   - Build göründükten sonra (birkaç dakika sürebilir)
   - Build'in yanındaki "..." menüsünden veya sağ taraftan
   - **"Submit for Review"** butonuna tıklayın

6. **Beta Review Formunu Doldurun:**
   - Beta App Review Information bölümünü doldurun
   - Test bilgilerini girin (kullanıcı adı, şifre vs. - eğer gerekiyorsa)
   - "Submit" butonuna tıklayın

---

## ADIM 5: TestFlight Review Onayı

- **Beta review genellikle 1-2 saat içinde onaylanır**
- Onaylandıktan sonra TestFlight'tan test edilebilir
- Test kullanıcılarını ekleyebilirsiniz
- Internal Testing için review gerekmez (daha hızlı)

---

## Sorun Giderme

### .ipa dosyası indirilmiyor:
- Tarayıcıdan direkt linke tıklayın
- Login gerekebilir (expo.dev hesabınızla)

### Transporter'da hata alıyorsanız:
- Apple ID'nizin Apple Developer Program'a üye olduğundan emin olun
- İki faktörlü doğrulama aktif olmalı
- Network bağlantınızı kontrol edin

### Build App Store Connect'te görünmüyor:
- Yüklemenin tamamlanmasını bekleyin (5-10 dakika)
- "Activity" sekmesinde durumu kontrol edin
- Hata varsa Transporter'da görünecektir

---

## Başarı!

Build başarıyla yüklendikten ve review onaylandıktan sonra:
- TestFlight uygulamasından test edebilirsiniz
- Test kullanıcıları ekleyebilirsiniz
- Beta test başlatabilirsiniz

