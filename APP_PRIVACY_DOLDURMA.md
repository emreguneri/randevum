# App Privacy Doldurma Rehberi

## 📍 App Store Connect'te Nerede?

1. **App Store Connect** → **Randevum** uygulamasını açın
2. Sol menüden **"App Privacy"** seçeneğine tıklayın
3. Şu anda bu sayfadasınız ✅

---

## 📋 Randevum Uygulaması - Toplanan Veriler

Uygulamanız şu verileri topluyor:

### 1. **Location (Konum Bilgileri)** ✅
- **Neden:** Yakındaki işletmeleri göstermek için
- **Nasıl:** `expo-location` kullanılıyor
- **Ne zaman:** Kullanıcı harita görünümünü açtığında
- **Paylaşım:** Üçüncü taraflarla paylaşılmıyor

### 2. **Personal Information (Kişisel Bilgiler)** ✅
- **Neden:** Randevu oluşturmak ve kullanıcı hesabı yönetmek için
- **Türler:**
  - İsim (Name)
  - E-posta (Email)
  - Telefon numarası (Phone Number)
- **Nasıl:** Firebase Authentication ve Firestore'da saklanıyor
- **Paylaşım:** Üçüncü taraflarla paylaşılmıyor (sadece işletme sahipleri randevu bilgilerini görüyor)

### 3. **Photos or Videos (Fotoğraf/Video)** ⚠️ Opsiyonel
- **Neden:** İşletme sahipleri dükkan fotoğrafları ekleyebilir
- **Nasıl:** `expo-image-picker` kullanılıyor
- **Ne zaman:** Sadece işletme sahipleri kullanıyor
- **Paylaşım:** Üçüncü taraflarla paylaşılmıyor

### 4. **User Content (Kullanıcı İçeriği)** ✅
- **Neden:** Kullanıcılar yorum ve değerlendirme yapabiliyor
- **Türler:**
  - Yorumlar (Reviews)
  - Değerlendirmeler (Ratings)
- **Nasıl:** Firestore'da saklanıyor
- **Paylaşım:** Herkese açık (işletme sayfalarında görünüyor)

---

## 🎯 App Privacy Formu - Adım Adım

### Adım 1: "Get Started" veya "Edit" Butonuna Tıklayın

Sayfada "Get Started" veya "Edit" butonu görünecek. Tıklayın.

---

### Adım 2: Veri Toplama Türlerini Seçin

Form açıldığında, toplanan veri türlerini seçmeniz gerekecek:

#### 1. Location (Konum) ✅
- **"Location"** seçeneğini işaretleyin
- **"Precise Location"** seçeneğini işaretleyin (yakın işletmeleri göstermek için)
- **"Approximate Location"** seçeneğini işaretlemeyin

#### 2. Personal Information (Kişisel Bilgiler) ✅
- **"Personal Information"** seçeneğini işaretleyin
- Alt seçenekler:
  - ✅ **"Name"** (İsim)
  - ✅ **"Email Address"** (E-posta)
  - ✅ **"Phone Number"** (Telefon numarası)
  - ❌ Diğer seçenekleri işaretlemeyin

#### 3. Photos or Videos (Fotoğraf/Video) ⚠️
- **"Photos or Videos"** seçeneğini işaretleyin (opsiyonel ama işletme sahipleri kullanıyor)
- **"Photos"** seçeneğini işaretleyin
- **"Videos"** seçeneğini işaretlemeyin (kullanılmıyor)

#### 4. User Content (Kullanıcı İçeriği) ✅
- **"User Content"** seçeneğini işaretleyin
- Alt seçenekler:
  - ✅ **"Other User Content"** (Yorumlar ve değerlendirmeler)

---

### Adım 3: Her Veri Türü İçin Detayları Doldurun

Her veri türü için şu sorular sorulacak:

#### Location (Konum) İçin:

**1. "Is this data used to track you?" (Bu veri sizi takip etmek için kullanılıyor mu?)**
- **Cevap:** **"No"** ❌
- **Açıklama:** Konum sadece yakındaki işletmeleri göstermek için kullanılıyor, takip için değil

**2. "Is this data linked to your identity?" (Bu veri kimliğinize bağlı mı?)**
- **Cevap:** **"No"** ❌ (veya **"Yes"** ✅ - kullanıcı hesabına bağlı olabilir)
- **Açıklama:** Konum bilgisi kullanıcı hesabına bağlı değil, sadece anlık kullanılıyor

**3. "Is this data used for third-party advertising?" (Bu veri üçüncü taraf reklamları için kullanılıyor mu?)**
- **Cevap:** **"No"** ❌

**4. "What is this data used for?" (Bu veri ne için kullanılıyor?)**
- **Cevap:** **"App Functionality"** ✅ (Uygulama işlevselliği)
- **Açıklama:** Yakındaki işletmeleri göstermek için

**5. "Is this data collected from this app?" (Bu veri bu uygulamadan toplanıyor mu?)**
- **Cevap:** **"Yes"** ✅

---

#### Personal Information (Kişisel Bilgiler) İçin:

**1. "Is this data used to track you?"**
- **Cevap:** **"No"** ❌

**2. "Is this data linked to your identity?"**
- **Cevap:** **"Yes"** ✅
- **Açıklama:** Kullanıcı hesabına bağlı

**3. "Is this data used for third-party advertising?"**
- **Cevap:** **"No"** ❌

**4. "What is this data used for?"**
- **Cevap:** **"App Functionality"** ✅ (Uygulama işlevselliği)
- **Açıklama:** Randevu oluşturmak ve kullanıcı hesabı yönetmek için

**5. "Is this data collected from this app?"**
- **Cevap:** **"Yes"** ✅

---

#### Photos or Videos (Fotoğraf/Video) İçin:

**1. "Is this data used to track you?"**
- **Cevap:** **"No"** ❌

**2. "Is this data linked to your identity?"**
- **Cevap:** **"Yes"** ✅ (işletme sahipleri için)

**3. "Is this data used for third-party advertising?"**
- **Cevap:** **"No"** ❌

**4. "What is this data used for?"**
- **Cevap:** **"App Functionality"** ✅ (Uygulama işlevselliği)
- **Açıklama:** İşletme fotoğrafları eklemek için

**5. "Is this data collected from this app?"**
- **Cevap:** **"Yes"** ✅

---

#### User Content (Kullanıcı İçeriği) İçin:

**1. "Is this data used to track you?"**
- **Cevap:** **"No"** ❌

**2. "Is this data linked to your identity?"**
- **Cevap:** **"Yes"** ✅ (yorumlar kullanıcıya bağlı)

**3. "Is this data used for third-party advertising?"**
- **Cevap:** **"No"** ❌

**4. "What is this data used for?"**
- **Cevap:** **"App Functionality"** ✅ (Uygulama işlevselliği)
- **Açıklama:** İşletmeler hakkında yorum ve değerlendirme yapmak için

**5. "Is this data collected from this app?"**
- **Cevap:** **"Yes"** ✅

---

### Adım 4: Üçüncü Taraf Paylaşımı

**"Do you share data with third parties?" (Verileri üçüncü taraflarla paylaşıyor musunuz?)**
- **Cevap:** **"No"** ❌
- **Açıklama:** Veriler sadece Firebase'de saklanıyor, üçüncü taraflarla paylaşılmıyor

---

### Adım 5: Kaydetme

1. Tüm soruları cevapladıktan sonra **"Save"** veya **"Done"** butonuna tıklayın
2. Başarılı mesajını bekleyin

---

## ✅ Özet - Tüm Cevaplar

### Location (Konum):
- Track: **No**
- Linked to Identity: **No** (veya **Yes** - kullanıcı hesabına bağlı olabilir)
- Third-party Advertising: **No**
- Used for: **App Functionality**
- Collected from app: **Yes**

### Personal Information (Kişisel Bilgiler):
- Track: **No**
- Linked to Identity: **Yes**
- Third-party Advertising: **No**
- Used for: **App Functionality**
- Collected from app: **Yes**
- Types: **Name, Email Address, Phone Number**

### Photos or Videos (Fotoğraf/Video):
- Track: **No**
- Linked to Identity: **Yes**
- Third-party Advertising: **No**
- Used for: **App Functionality**
- Collected from app: **Yes**
- Types: **Photos** (Videos: No)

### User Content (Kullanıcı İçeriği):
- Track: **No**
- Linked to Identity: **Yes**
- Third-party Advertising: **No**
- Used for: **App Functionality**
- Collected from app: **Yes**
- Types: **Other User Content**

### Third-party Sharing:
- **No** - Veriler üçüncü taraflarla paylaşılmıyor

---

## ⚠️ Önemli Notlar

1. **"Track" (Takip):** Sadece reklam veya veri broker'larına satış için kullanılıyorsa "Yes" olur. Randevum'da böyle bir kullanım yok, bu yüzden **"No"**.

2. **"Linked to Identity":** Kullanıcı hesabına bağlı veriler için "Yes". Konum bilgisi anlık kullanılıyorsa "No" olabilir.

3. **"Third-party Advertising":** Reklam için kullanılıyorsa "Yes". Randevum'da reklam yok, bu yüzden **"No"**.

4. **"App Functionality":** Uygulamanın temel işlevselliği için kullanılan veriler. Randevum'da tüm veriler bu kategoriye giriyor.

5. **Firebase:** Firebase, Apple'ın gözünde "third-party" sayılmaz çünkü sizin kontrolünüzde olan bir backend servisi. Ancak yine de dikkatli olun.

---

## 🆘 Sorun Yaşarsanız

- **Form açılmıyor mu?** → Sayfayı yenileyin
- **Hangi verileri seçeceğimi bilmiyorum?** → Yukarıdaki listeye bakın
- **"Track" ne demek?** → Reklam veya veri broker'larına satış için kullanılıyorsa "Yes", değilse "No"
- **Firebase üçüncü taraf mı?** → Hayır, sizin kontrolünüzde olan bir backend servisi

---

## ✅ Tamamlandığında

App Privacy doldurulduktan sonra:
1. ✅ Tüm veri türleri seçildi
2. ✅ Her veri türü için sorular cevaplandı
3. ✅ Üçüncü taraf paylaşımı "No" olarak işaretlendi
4. ✅ Kaydedildi

**Sonraki adım:** Screenshots hazırlama veya App Icon yükleme

