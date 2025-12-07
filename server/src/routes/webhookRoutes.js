const express = require('express');
const admin = require('../config/firebaseAdmin');
const router = express.Router();

// iyzico Subscription API webhook/callback endpoint
// iyzico'dan gelen abonelik durumu bildirimlerini işler
router.post('/iyzico/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    
    console.log('[Webhook] iyzico callback alındı:', JSON.stringify(callbackData, null, 2));
    
    // iyzico callback formatı (örnek):
    // - subscriptionReferenceCode: Abonelik referans kodu
    // - status: Abonelik durumu (ACTIVE, CANCELLED, FAILED, etc.)
    // - eventType: Olay tipi (RENEWAL, CANCELLATION, PAYMENT_FAILED, etc.)
    // - paymentStatus: Ödeme durumu
    
    const subscriptionReferenceCode = 
      callbackData?.subscriptionReferenceCode || 
      callbackData?.referenceCode ||
      callbackData?.data?.subscriptionReferenceCode;
    const status = callbackData?.status || callbackData?.data?.status;
    const eventType = callbackData?.eventType || callbackData?.event || callbackData?.data?.eventType;
    const paymentStatus = callbackData?.paymentStatus || callbackData?.data?.paymentStatus || status;
    
    if (!subscriptionReferenceCode) {
      console.warn('[Webhook] subscriptionReferenceCode bulunamadı');
      return res.status(200).json({
        status: 'error',
        message: 'subscriptionReferenceCode gerekli',
      });
    }
    
    console.log('[Webhook] İşleniyor:', {
      subscriptionReferenceCode,
      status,
      eventType,
      paymentStatus,
      timestamp: new Date().toISOString(),
    });
    
    // Firestore'da subscriptionReferenceCode ile kullanıcıyı bul
    if (admin.apps.length > 0) {
      try {
        const db = admin.firestore();
        const usersSnapshot = await db
          .collection('users')
          .where('iyzico.subscriptionReferenceCode', '==', subscriptionReferenceCode)
          .limit(1)
          .get();
        
        if (usersSnapshot.empty) {
          console.warn('[Webhook] Kullanıcı bulunamadı:', subscriptionReferenceCode);
          return res.status(200).json({
            status: 'warning',
            message: 'Kullanıcı bulunamadı',
          });
        }
        
        const userDoc = usersSnapshot.docs[0];
        const updateData = {
          'iyzico.lastWebhookReceivedAt': admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        // Duruma göre Firestore'u güncelle
        if (status === 'CANCELLED' || eventType === 'CANCELLATION' || eventType === 'SUBSCRIPTION_CANCELLED') {
          // Abonelik iptal edildi
          updateData.subscriptionStatus = 'inactive';
          updateData.subscriptionCancelledAt = admin.firestore.FieldValue.serverTimestamp();
          console.log('[Webhook] Abonelik iptal edildi:', subscriptionReferenceCode);
        } else if (eventType === 'RENEWAL' || eventType === 'SUBSCRIPTION_RENEWED') {
          if (paymentStatus === 'SUCCESS' || status === 'ACTIVE') {
            // Abonelik yenilendi
            const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 gün sonrası
            updateData.subscriptionStatus = 'active';
            updateData.subscriptionEndsAt = newEndDate.toISOString();
            updateData.lastRenewalAt = admin.firestore.FieldValue.serverTimestamp();
            console.log('[Webhook] Abonelik yenilendi:', subscriptionReferenceCode);
          }
        } else if (eventType === 'PAYMENT_FAILED' || eventType === 'PAYMENT_FAILURE') {
          // Ödeme başarısız
          updateData.subscriptionStatus = 'failed';
          updateData.lastPaymentFailedAt = admin.firestore.FieldValue.serverTimestamp();
          console.log('[Webhook] Ödeme başarısız:', subscriptionReferenceCode);
        } else if (status === 'ACTIVE' && !updateData.subscriptionStatus) {
          // Abonelik aktif
          updateData.subscriptionStatus = 'active';
          console.log('[Webhook] Abonelik aktif:', subscriptionReferenceCode);
        }
        
        await userDoc.ref.update(updateData);
        console.log('[Webhook] ✅ Firestore güncellendi:', userDoc.id);
      } catch (firestoreError) {
        console.error('[Webhook] Firestore güncelleme hatası:', firestoreError);
        // Hata olsa bile 200 döndür (iyzico tekrar denemesin diye)
      }
    } else {
      console.warn('[Webhook] Firebase Admin SDK initialize edilmemiş, Firestore güncellemesi yapılamadı');
    }
    
    // iyzico'ya başarılı yanıt gönder (200 OK)
    return res.status(200).json({
      status: 'success',
      message: 'Callback işlendi',
    });
  } catch (error) {
    console.error('[Webhook] Callback işleme hatası:', error);
    // Hata olsa bile 200 döndür (iyzico tekrar denemesin diye)
    return res.status(200).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;

