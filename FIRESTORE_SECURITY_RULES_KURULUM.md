# Firestore Security Rules Kurulum Rehberi

Bu rehber, production-ready Firestore security rules'larını Firebase Console'a nasıl yükleyeceğinizi açıklar.

## 📋 Önkoşullar

- Firebase Console'a erişim
- Firestore veritabanı aktif olmalı

## 🔐 Güvenlik Kuralları Özeti

Oluşturulan `firestore.rules` dosyası şu güvenlik kurallarını içerir:

### 1. **users** Koleksiyonu
- ✅ Kullanıcılar sadece kendi verilerini okuyup yazabilir
- ✅ `role`, `subscriptionStatus` gibi kritik alanlar sadece backend tarafından güncellenebilir
- ❌ Silme işlemi yasak (veri kaybını önlemek için)

### 2. **shops** Koleksiyonu
- ✅ Herkes işletmeleri okuyabilir (public booking form için gerekli)
- ✅ Sadece işletme sahibi (ownerId) kendi işletmesini oluşturabilir/güncelleyebilir/silebilir
- ✅ Admin rolü kontrolü yapılır

### 3. **bookings** Koleksiyonu
- ✅ Herkes yeni randevu oluşturabilir (public booking form için)
- ✅ Randevu sahibi (customerId) kendi randevusunu okuyabilir
- ✅ İşletme sahibi (ownerId) kendi işletmesinin randevularını okuyabilir
- ✅ İşletme sahibi randevu durumunu güncelleyebilir
- ✅ Randevu sahibi sadece iptal edebilir
- ❌ Silme işlemi yasak

### 4. **favorites** Koleksiyonu (Opsiyonel)
- ✅ Kullanıcılar sadece kendi favorilerini yönetebilir

## 📝 Kurulum Adımları (Detaylı)

### Adım 1: Firebase Console'a Giriş

1. Tarayıcınızda [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Google hesabınızla giriş yapın
3. Projenizi seçin (örneğin, `randevum-66b5e` veya proje adınız)

### Adım 2: Firestore Database'e Erişim

1. Sol menüden **"Firestore Database"** (veya Türkçe ise **"Firestore Veritabanı"**) seçeneğine tıklayın
   - Eğer Firestore henüz aktif değilse, "Create database" (Veritabanı oluştur) butonuna tıklayın ve "Start in test mode" seçeneğini seçin
2. Üstteki sekmelerden **"Rules"** (Kurallar) sekmesine tıklayın
   - Sekmeler şunlar olabilir: "Data", "Rules", "Indexes", "Usage"

### Adım 3: Mevcut Kuralları Kontrol Edin

Firebase Console'da şu anda varsayılan kurallar olabilir. Rules editöründe şu gibi bir kod göreceksiniz:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Veya allow read, write: if request.time < timestamp.date(2024, 1, 1);
    }
  }
}
```

**⚠️ Önemli:** 
- Eğer şu anda `allow read, write: if true;` gibi açık kurallar varsa, bunları **hemen** değiştirmelisiniz!
- Bu tür kurallar herkesin verilerinize erişmesine izin verir ve güvenlik riski oluşturur

### Adım 4: `firestore.rules` Dosyasını Açın

**Yöntem 1: Finder ile (macOS)**
1. Finder'ı açın
2. Projenizin ana dizinine gidin: `/Users/emreguneri/Berber/`
3. `firestore.rules` dosyasını bulun
4. Dosyaya çift tıklayarak açın (varsayılan metin editöründe açılacak)
5. **Tüm içeriği seçin** (⌘+A)
6. **Kopyalayın** (⌘+C)

**Yöntem 2: VS Code ile**
1. VS Code'u açın
2. `File` → `Open File...` (veya ⌘+O)
3. `/Users/emreguneri/Berber/firestore.rules` dosyasını seçin
4. **Tüm içeriği seçin** (⌘+A)
5. **Kopyalayın** (⌘+C)

**Yöntem 3: Terminal ile (macOS)**
1. Terminal'i açın
2. Şu komutu çalıştırın:
   ```bash
   open /Users/emreguneri/Berber/firestore.rules
   ```
3. Dosya varsayılan editörde açılacak
4. **Tüm içeriği seçin** (⌘+A)
5. **Kopyalayın** (⌘+C)

### Adım 5: Firebase Console'a Yapıştırın

1. Firebase Console'daki Rules editörüne geri dönün
2. Mevcut tüm kodu **seçin ve silin** (⌘+A → Delete veya Ctrl+A → Delete)
3. Kopyaladığınız yeni kuralları **yapıştırın** (⌘+V veya Ctrl+V)

**Not:** Rules editörü büyük bir kod editörü gibi görünür. İçinde syntax highlighting (renklendirme) olabilir.

### Adım 6: Syntax Kontrolü

1. Yapıştırdıktan sonra, Firebase Console otomatik olarak syntax kontrolü yapar
2. Eğer **kırmızı çizgiler** veya **hata mesajları** görürseniz:
   - Dosyayı tekrar kontrol edin
   - Tüm kodun doğru kopyalandığından emin olun
   - Parantezlerin ve süslü parantezlerin eşleştiğinden emin olun

### Adım 7: Kuralları Yayınlayın

1. Rules editörünün **sağ üst köşesinde** **"Publish"** (Yayınla) butonuna tıklayın
2. Onay penceresi açılabilir, **"Publish"** butonuna tekrar tıklayın
3. Birkaç saniye bekleyin, kurallar yayınlanacak
4. Başarılı olduğunda yeşil bir onay mesajı göreceksiniz: **"Rules published successfully"** (Kurallar başarıyla yayınlandı)

### Adım 8: Kuralları Doğrulayın

1. Rules sekmesinde yeni kurallarınızı görmelisiniz
2. **"Rules Playground"** sekmesine giderek test edebilirsiniz (opsiyonel)
3. Artık güvenli kurallar aktif!

### Adım 5: Kuralları Test Edin

Firebase Console'da **"Rules Playground"** sekmesini kullanarak kuralları test edebilirsiniz:

1. **Rules Playground** sekmesine gidin
2. Test senaryoları oluşturun:
   - Kullanıcı kendi verisini okuma/yazma
   - Başka kullanıcının verisini okuma/yazma (reddedilmeli)
   - Public booking oluşturma
   - İşletme sahibi randevu durumu güncelleme

## 🔍 Kuralları Doğrulama

Kuralların doğru çalıştığını test etmek için:

### Test 1: Kullanıcı Kendi Verisini Okuma
```javascript
// ✅ İzin verilmeli
const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
```

### Test 2: Başka Kullanıcının Verisini Okuma
```javascript
// ❌ Reddedilmeli
const otherUserDoc = await getDoc(doc(db, 'users', 'other-user-uid'));
```

### Test 3: Public Booking Oluşturma
```javascript
// ✅ İzin verilmeli (guest mode)
await addDoc(collection(db, 'bookings'), {
  name: 'Test User',
  phone: '5551234567',
  shopSlug: 'test-shop',
  // ...
});
```

### Test 4: İşletme Sahibi Randevu Durumu Güncelleme
```javascript
// ✅ İzin verilmeli (ownerId eşleşiyorsa)
await updateDoc(doc(db, 'bookings', bookingId), {
  status: 'confirmed'
});
```

## ⚠️ Önemli Notlar

1. **Backend Güncellemeleri:**
   - `role`, `subscriptionStatus` gibi alanlar sadece backend (Firebase Admin SDK) tarafından güncellenebilir
   - Client-side'dan bu alanları güncellemeye çalışırsanız reddedilir

2. **Guest Bookings:**
   - Public booking form'u için `customerId` null olabilir
   - Bu durumda sadece `ownerId` ile eşleşen kullanıcılar randevuyu okuyabilir

3. **Silme İşlemleri:**
   - `users` ve `bookings` koleksiyonlarında silme işlemi yasak
   - Veri kaybını önlemek için `status: 'cancelled'` veya `deleted: true` gibi soft delete kullanın

4. **Performans:**
   - Rules içinde `get()` fonksiyonu kullanımı ekstra okuma maliyeti yaratır
   - Mümkün olduğunca `request.auth` ve `resource.data` kullanın

## 🐛 Sorun Giderme

### Hata: "Missing or insufficient permissions"

**Neden:** Kullanıcı yetkisi yok veya kurallar yanlış yapılandırılmış.

**Çözüm:**
1. Firebase Console'da Rules sekmesinde syntax hatası var mı kontrol edin
2. Kullanıcının authenticated olduğundan emin olun
3. `request.auth.uid` ve `resource.data.ownerId` değerlerini kontrol edin

### Hata: "The query requires an index"

**Neden:** Firestore query'si için composite index gerekiyor.

**Çözüm:**
1. Hata mesajındaki linke tıklayın
2. Firebase Console'da otomatik olarak index oluşturun
3. Index oluşturulana kadar bekleyin (birkaç dakika sürebilir)

### Kurallar Çalışmıyor

**Kontrol Listesi:**
- ✅ Rules dosyası Firebase Console'a yüklendi mi?
- ✅ "Publish" butonuna tıklandı mı?
- ✅ Syntax hatası var mı? (Console'da kırmızı uyarı gösterir)
- ✅ Kullanıcı authenticated mı?
- ✅ `request.auth.uid` doğru mu?

## 📚 Ek Kaynaklar

- [Firestore Security Rules Dokümantasyonu](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firestore Rules Playground](https://console.firebase.google.com/project/_/firestore/rules)

## ✅ Sonraki Adımlar

Kuralları yükledikten sonra:
1. Test senaryolarını çalıştırın
2. Mobil ve web uygulamalarında test edin
3. Production'a geçmeden önce tüm senaryoları doğrulayın

