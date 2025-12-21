import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { router, useFocusEffect } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SubscriptionSettings() {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    paymentStatus: 'active' | 'inactive';
    daysRemaining: number | null;
    subscriptionEndDate: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSubscriptionInfo = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Firestore'dan kullanıcı bilgilerini al
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Eğer subscriptionStatus active ise
        if (userData?.subscriptionStatus === 'active') {
          // subscriptions koleksiyonundan detaylı bilgi al
          const subscriptionsQuery = query(
            collection(db, 'subscriptions'),
            where('userId', '==', user.uid),
            where('paymentStatus', '==', 'active')
          );
          const subscriptionsSnap = await getDocs(subscriptionsQuery);

          if (!subscriptionsSnap.empty) {
            const subData = subscriptionsSnap.docs[0].data();
            const endDate = subData.endDate?.toDate ? subData.endDate.toDate() : new Date(subData.endDate);
            const today = new Date();
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setSubscriptionInfo({
              paymentStatus: 'active',
              daysRemaining: diffDays > 0 ? diffDays : 0,
              subscriptionEndDate: endDate.toLocaleDateString('tr-TR'),
            });
            setLoading(false);
            return;
          }

          // subscriptions koleksiyonunda bulunamadıysa users'dan al
          const subscriptionEndRaw = userData.subscriptionEndsAt;
          if (subscriptionEndRaw) {
            const endDate = subscriptionEndRaw?.toDate ? subscriptionEndRaw.toDate() : new Date(subscriptionEndRaw);
            const today = new Date();
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setSubscriptionInfo({
              paymentStatus: 'active',
              daysRemaining: diffDays > 0 ? diffDays : 0,
              subscriptionEndDate: endDate.toLocaleDateString('tr-TR'),
            });
            setLoading(false);
            return;
          }

          setSubscriptionInfo({
            paymentStatus: 'active',
            daysRemaining: null,
            subscriptionEndDate: null,
          });
          setLoading(false);
          return;
        }
      }

      setSubscriptionInfo({
        paymentStatus: 'inactive',
        daysRemaining: null,
        subscriptionEndDate: null,
      });
    } catch (error) {
      console.error('Error loading subscription info:', error);
      setSubscriptionInfo({
        paymentStatus: 'inactive',
        daysRemaining: null,
        subscriptionEndDate: null,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      loadSubscriptionInfo();
    }, [loadSubscriptionInfo])
  );

  const handleRenewSubscription = () => {
    router.push('/payment?renew=true');
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Aboneliği İptal Et',
      'Aboneliğinizi iptal etmek istediğinizden emin misiniz? Abonelik bitiş tarihine kadar kullanmaya devam edebilirsiniz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: () => {
            // TODO: Abonelik iptal işlemi (backend'de yapılacak)
            Alert.alert('Bilgi', 'Abonelik iptal işlemi yakında eklenecektir.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Abonelik Ayarları</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Abonelik Ayarları</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {subscriptionInfo?.paymentStatus === 'active' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mevcut Abonelik</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
                  <View style={styles.infoDetails}>
                    <Text style={styles.infoLabel}>Durum</Text>
                    <Text style={[styles.infoValue, { color: '#10b981' }]}>Aktif</Text>
                  </View>
                </View>

                {subscriptionInfo.daysRemaining !== null && (
                  <View style={styles.infoRow}>
                    <IconSymbol name="calendar" size={20} color="#ef4444" />
                    <View style={styles.infoDetails}>
                      <Text style={styles.infoLabel}>Kalan Gün</Text>
                      <Text style={[
                        styles.infoValue,
                        { color: (subscriptionInfo.daysRemaining || 0) <= 7 ? '#f59e0b' : '#1e293b' }
                      ]}>
                        {subscriptionInfo.daysRemaining} gün
                      </Text>
                    </View>
                  </View>
                )}

                {subscriptionInfo.subscriptionEndDate && (
                  <View style={styles.infoRow}>
                    <IconSymbol name="clock.fill" size={20} color="#ef4444" />
                    <View style={styles.infoDetails}>
                      <Text style={styles.infoLabel}>Bitiş Tarihi</Text>
                      <Text style={styles.infoValue}>{subscriptionInfo.subscriptionEndDate}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Abonelik İşlemleri</Text>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.renewButton]}
                onPress={handleRenewSubscription}
              >
                <IconSymbol name="arrow.clockwise" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Aboneliği Yenile</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelSubscription}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Aboneliği İptal Et</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <View style={styles.emptyCard}>
              <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#f59e0b" />
              <Text style={styles.emptyTitle}>Aktif Abonelik Yok</Text>
              <Text style={styles.emptyDescription}>
                İşletme özelliklerini kullanmak için abonelik satın almanız gerekiyor.
              </Text>
              <TouchableOpacity 
                style={styles.subscribeButton}
                onPress={() => router.push('/payment')}
              >
                <Text style={styles.subscribeButtonText}>Abonelik Satın Al</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoDetails: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  renewButton: {
    backgroundColor: '#ef4444',
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  subscribeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

