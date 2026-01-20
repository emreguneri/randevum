import * as RNIap from 'react-native-iap';
import { Platform, Alert } from 'react-native';

// App Store Connect'te oluşturulacak subscription ID'ler
// Bu ID'ler App Store Connect'te tanımlanacak
export const SUBSCRIPTION_IDS = {
  MONTHLY: 'com.happyhour.randevum.subscription.monthly',
  THREE_MONTHS: 'com.happyhour.randevum.subscription.3months',
  SIX_MONTHS: 'com.happyhour.randevum.subscription.6months',
  TWELVE_MONTHS: 'com.happyhour.randevum.subscription.12months',
};

// Süre bazlı subscription ID mapping
export const getSubscriptionIdForDuration = (months: number): string => {
  switch (months) {
    case 1:
      return SUBSCRIPTION_IDS.MONTHLY;
    case 3:
      return SUBSCRIPTION_IDS.THREE_MONTHS;
    case 6:
      return SUBSCRIPTION_IDS.SIX_MONTHS;
    case 12:
      return SUBSCRIPTION_IDS.TWELVE_MONTHS;
    default:
      return SUBSCRIPTION_IDS.MONTHLY;
  }
};

class IAPService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private isInitialized = false;

  /**
   * IAP servisini başlat
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('[IAP] iOS değil, IAP kullanılamaz');
      return false;
    }

    if (this.isInitialized) {
      return true;
    }

    try {
      await RNIap.initConnection();
      this.isInitialized = true;
      console.log('[IAP] Bağlantı başarılı');
      return true;
    } catch (error) {
      console.error('[IAP] Bağlantı hatası:', error);
      return false;
    }
  }

  /**
   * Mevcut abonelikleri kontrol et
   */
  async getAvailableSubscriptions(): Promise<RNIap.Subscription[]> {
    if (Platform.OS !== 'ios' || !this.isInitialized) {
      return [];
    }

    try {
      const productIds = Object.values(SUBSCRIPTION_IDS);
      const subscriptions = await RNIap.getSubscriptions({ skus: productIds });
      console.log('[IAP] Mevcut abonelikler:', subscriptions);
      return subscriptions;
    } catch (error) {
      console.error('[IAP] Abonelikler yüklenemedi:', error);
      return [];
    }
  }

  /**
   * Kullanıcının aktif aboneliklerini kontrol et
   */
  async getActiveSubscriptions(): Promise<RNIap.Purchase[]> {
    if (Platform.OS !== 'ios' || !this.isInitialized) {
      return [];
    }

    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.log('[IAP] Aktif abonelikler:', purchases);
      return purchases;
    } catch (error) {
      console.error('[IAP] Aktif abonelikler yüklenemedi:', error);
      return [];
    }
  }

  /**
   * Abonelik satın alma
   */
  async purchaseSubscription(
    subscriptionId: string,
    onSuccess: (purchase: RNIap.Purchase) => Promise<void>,
    onError: (error: any) => void
  ): Promise<void> {
    if (Platform.OS !== 'ios' || !this.isInitialized) {
      onError(new Error('IAP sadece iOS\'ta kullanılabilir'));
      return;
    }

    try {
      // Purchase listener'ları ayarla
      this.setupPurchaseListeners(onSuccess, onError);

      // Satın alma işlemini başlat
      await RNIap.requestSubscription({
        sku: subscriptionId,
        andDangerouslyFinishTransactionAutomatically: false, // Backend'de doğrulama yapacağız
      });
    } catch (error: any) {
      console.error('[IAP] Satın alma hatası:', error);
      this.cleanupPurchaseListeners();
      
      if (error.code === 'E_USER_CANCELLED') {
        onError(new Error('Kullanıcı işlemi iptal etti'));
      } else {
        onError(error);
      }
    }
  }

  /**
   * Purchase listener'ları ayarla
   */
  private setupPurchaseListeners(
    onSuccess: (purchase: RNIap.Purchase) => Promise<void>,
    onError: (error: any) => void
  ) {
    // Purchase güncellemelerini dinle
    this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase: RNIap.Purchase) => {
        try {
          console.log('[IAP] Satın alma başarılı:', purchase);
          
          // Backend'e receipt gönder ve doğrula
          await onSuccess(purchase);
          
          // Transaction'ı tamamla (backend doğrulamasından sonra)
          // await RNIap.finishTransaction({ purchase });
        } catch (error) {
          console.error('[IAP] Satın alma işleme hatası:', error);
          onError(error);
        } finally {
          this.cleanupPurchaseListeners();
        }
      }
    );

    // Purchase hatalarını dinle
    this.purchaseErrorSubscription = RNIap.purchaseErrorListener(
      (error: RNIap.PurchaseError) => {
        console.error('[IAP] Satın alma hatası:', error);
        this.cleanupPurchaseListeners();
        
        if (error.code === 'E_USER_CANCELLED') {
          onError(new Error('Kullanıcı işlemi iptal etti'));
        } else {
          onError(error);
        }
      }
    );
  }

  /**
   * Purchase listener'ları temizle
   */
  private cleanupPurchaseListeners() {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
  }

  /**
   * Transaction'ı tamamla (backend doğrulamasından sonra)
   */
  async finishTransaction(purchase: RNIap.Purchase): Promise<void> {
    if (Platform.OS !== 'ios' || !this.isInitialized) {
      return;
    }

    try {
      await RNIap.finishTransaction({ purchase });
      console.log('[IAP] Transaction tamamlandı');
    } catch (error) {
      console.error('[IAP] Transaction tamamlanamadı:', error);
    }
  }

  /**
   * Bekleyen transaction'ları kontrol et ve tamamla
   */
  async checkPendingTransactions(): Promise<void> {
    if (Platform.OS !== 'ios' || !this.isInitialized) {
      return;
    }

    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.log('[IAP] Bekleyen transaction\'lar:', purchases);
      // Bu transaction'lar backend'de doğrulandıktan sonra finishTransaction ile tamamlanmalı
    } catch (error) {
      console.error('[IAP] Bekleyen transaction\'lar kontrol edilemedi:', error);
    }
  }

  /**
   * Bağlantıyı kapat
   */
  async disconnect(): Promise<void> {
    if (Platform.OS !== 'ios' || !this.isInitialized) {
      return;
    }

    try {
      this.cleanupPurchaseListeners();
      await RNIap.endConnection();
      this.isInitialized = false;
      console.log('[IAP] Bağlantı kapatıldı');
    } catch (error) {
      console.error('[IAP] Bağlantı kapatılamadı:', error);
    }
  }
}

export const iapService = new IAPService();

