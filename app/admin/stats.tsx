import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
  });
  const [shopName, setShopName] = useState('');
  const [shopData, setShopData] = useState({
    totalCustomers: 156,
    monthlyRevenue: '₺8,500',
    rating: 4.8,
  });

  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadShopName();
      loadShopData();
    }, [])
  );

  const loadShopName = async () => {
    try {
      const shopData = await AsyncStorage.getItem('shopInfo');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        setShopName(parsed.name || '');
      }
    } catch (error) {
      console.error('Error loading shop name:', error);
    }
  };

  const loadShopData = async () => {
    try {
      const shopData = await AsyncStorage.getItem('shopInfo');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        setShopData({
          totalCustomers: parsed.totalCustomers || 156,
          monthlyRevenue: parsed.monthlyRevenue || '₺8,500',
          rating: parsed.rating || 4.8,
        });
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const appointmentsData = await AsyncStorage.getItem('appointments');
      if (!appointmentsData) {
        return;
      }

      const appointments = JSON.parse(appointmentsData);
      const shopData = await AsyncStorage.getItem('shopInfo');
      if (!shopData) {
        return;
      }

      const shop = JSON.parse(shopData);
      
      // Kendi dükkanına ait randevuları filtrele
      const shopAppointments = appointments.filter((apt: any) => apt.shopName === shop.name);
      
      // Benzersiz müşteri sayısı (basit hesaplama)
      const uniqueCustomers = new Set(shopAppointments.map((apt: any) => apt.shopName)).size;
      
      // Durumlara göre sayılar
      const completed = shopAppointments.filter((apt: any) => apt.status === 'Tamamlandı').length;
      const pending = shopAppointments.filter((apt: any) => apt.status === 'Beklemede' || apt.status === 'Onaylandı').length;
      const cancelled = shopAppointments.filter((apt: any) => apt.status === 'İptal').length;
      
      // Toplam gelir (basit hesaplama - tamamlanmış randevular için)
      // Gerçek uygulamada servis fiyatlarından hesaplanmalı
      const totalRevenue = completed * 50; // Örnek hesaplama

      setStats({
        totalCustomers: shopAppointments.length > 0 ? shopAppointments.length : 0,
        totalAppointments: shopAppointments.length,
        completedAppointments: completed,
        pendingAppointments: pending,
        cancelledAppointments: cancelled,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>İstatistikler</Text>
        <View style={styles.headerSpacer} />
      </View>

      {!shopName ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="exclamationmark.triangle" size={60} color="#f59e0b" />
          <Text style={styles.emptyTitle}>Dükkan bilgisi bulunamadı</Text>
          <Text style={styles.emptySubtitle}>
            İstatistikleri görmek için önce dükkan bilgilerinizi ekleyin
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Özet İstatistikler Kartı */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>{shopData.totalCustomers}</Text>
              <Text style={styles.summaryStatLabel}>Toplam Müşteri</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>{shopData.monthlyRevenue}</Text>
              <Text style={styles.summaryStatLabel}>Aylık Gelir</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatNumber}>{shopData.rating}</Text>
              <Text style={styles.summaryStatLabel}>Dükkan Puanı</Text>
            </View>
          </View>

          {/* Genel İstatistikler */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genel Bakış</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <IconSymbol name="person.2.fill" size={24} color="#ef4444" />
                </View>
                <Text style={styles.statNumber}>{stats.totalCustomers}</Text>
                <Text style={styles.statLabel}>Toplam Müşteri</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <IconSymbol name="calendar" size={24} color="#ef4444" />
                </View>
                <Text style={styles.statNumber}>{stats.totalAppointments}</Text>
                <Text style={styles.statLabel}>Toplam Randevu</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color="#10b981" />
                </View>
                <Text style={styles.statNumber}>{stats.completedAppointments}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <IconSymbol name="clock.fill" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.statNumber}>{stats.pendingAppointments}</Text>
                <Text style={styles.statLabel}>Bekleyen</Text>
              </View>
            </View>
          </View>

          {/* Gelir ve İptal */}
          <View style={styles.section}>
            <View style={styles.statsRow}>
              <View style={styles.revenueCard}>
                <View style={styles.revenueIconContainer}>
                  <IconSymbol name="dollarsign.circle.fill" size={32} color="#10b981" />
                </View>
                <Text style={styles.revenueLabel}>Toplam Gelir</Text>
                <Text style={styles.revenueAmount}>₺{stats.totalRevenue.toLocaleString('tr-TR')}</Text>
              </View>
              
              <View style={styles.cancelCard}>
                <View style={styles.cancelIconContainer}>
                  <IconSymbol name="xmark.circle.fill" size={32} color="#ef4444" />
                </View>
                <Text style={styles.cancelLabel}>İptal Edilen</Text>
                <Text style={styles.cancelAmount}>{stats.cancelledAppointments}</Text>
              </View>
            </View>
          </View>

          {/* Not */}
          <View style={styles.noteCard}>
            <IconSymbol name="info.circle" size={20} color="#64748b" />
            <Text style={styles.noteText}>
              İstatistikler kaydedilen randevulara göre hesaplanmaktadır. Gelir hesaplaması yaklaşık bir değerdir.
            </Text>
          </View>
        </View>
      )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerSpacer: {
    width: 40,
    marginLeft: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    justifyContent: 'space-between',
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 6,
  },
  summaryStatLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  revenueIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10b981',
  },
  cancelCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cancelIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  cancelAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ef4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});
