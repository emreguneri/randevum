# Firestore Reviews Index Kurulum Rehberi

## Sorun Nedir?

`reviews` koleksiyonunda yorumları yüklerken şu sorguyu kullanıyoruz:

```typescript
const reviewsQuery = query(
  collection(db, "reviews"),
  where("shopId", "==", shop.slug),
  orderBy("createdAt", "desc")
);
```

Bu sorgu **iki alan** kullanıyor:
1. `shopId` - Filtreleme için (`where`)
2. `createdAt` - Sıralama için (`orderBy`)

Firestore, birden fazla alan üzerinde sorgu yaparken **composite index** gerektirir.

## Çözüm: Index Oluşturma

### Yöntem 1: Otomatik (Önerilen) ⚡

1. Web sitesinde bir işletmenin yorumlar sekmesine gidin
2. Eğer index yoksa, tarayıcı konsolunda (F12) bir hata göreceksiniz
3. Hata mesajında bir **link** olacak, örneğin:
   ```
   https://console.firebase.google.com/v1/r/project/randevum-66b5e/firestore/indexes?create_composite=...
   ```
4. Bu linke tıklayın
5. Firebase Console'da "Create Index" butonuna tıklayın
6. Index oluşturulmasını bekleyin (1-2 dakika sürebilir)

### Yöntem 2: Manuel Oluşturma

1. **Firebase Console'a gidin**: https://console.firebase.google.com
2. Projenizi seçin: **randevum-66b5e**
3. Sol menüden **Firestore Database** > **Indexes** sekmesine gidin
4. **Create Index** butonuna tıklayın
5. Şu bilgileri girin:
   - **Collection ID**: `reviews`
   - **Fields to index**:
     - Field 1: `shopId` - Ascending
     - Field 2: `createdAt` - Descending
6. **Create** butonuna tıklayın
7. Index oluşturulmasını bekleyin (1-2 dakika)

### Yöntem 3: Firebase CLI ile (Gelişmiş)

`firestore.indexes.json` dosyası oluşturup otomatik deploy edebilirsiniz:

```json
{
  "indexes": [
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "shopId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

Sonra:
```bash
firebase deploy --only firestore:indexes
```

## Index Durumunu Kontrol Etme

1. Firebase Console > Firestore Database > Indexes
2. `reviews` koleksiyonu için index'i arayın
3. Status **"Enabled"** olmalı (yeşil tik işareti)

## Index Oluşturulana Kadar Ne Olur?

- Index oluşturulana kadar yorumlar yüklenmeyebilir
- Hata mesajı görebilirsiniz: "The query requires an index"
- Index oluşturulduktan sonra sorun çözülecektir

## Önemli Notlar

- Index oluşturma **ücretsizdir** (Firestore free tier'da bile)
- Index oluşturma **1-2 dakika** sürebilir
- Index oluşturulduktan sonra **otomatik olarak aktif** olur
- Her yeni composite sorgu için ayrı index gerekir

