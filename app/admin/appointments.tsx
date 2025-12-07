import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [shopName, setShopName] = useState('');
  const [shopId, setShopId] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadShopInfo();
      loadAppointments();
    }, [user])
  );

  const loadShopInfo = async () => {
    if (!user?.uid) return;
    
    try {
      // Firestore'dan shop bilgisini yükle
      const shopsQuery = query(collection(db, 'shops'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(shopsQuery);
      
      if (!snapshot.empty) {
        const shopDoc = snapshot.docs[0];
        const data = shopDoc.data();
        setShopName(data.name || '');
        setShopId(shopDoc.id);
      } else {
        // Fallback: AsyncStorage'dan yükle
        const shopData = await AsyncStorage.getItem('shopInfo');
        if (shopData) {
          const parsed = JSON.parse(shopData);
          setShopName(parsed.name || '');
        }
      }
    } catch (error) {
      console.error('Error loading shop info:', error);
      // Fallback: AsyncStorage'dan yükle
      try {
        const shopData = await AsyncStorage.getItem('shopInfo');
        if (shopData) {
          const parsed = JSON.parse(shopData);
          setShopName(parsed.name || '');
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  const loadAppointments = async () => {
    if (!user?.uid) return;
    
    try {
      // Firestore'dan bu işletme sahibine ait randevuları yükle
      const bookingsQuery = query(collection(db, 'bookings'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(bookingsQuery);
      
      const bookings = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          shopName: data.shopName || '',
          shopAddress: data.branch || '',
          customerName: data.name || '',
          customerPhone: data.phone || '',
          customerEmail: data.customerEmail || '',
          service: data.service || '',
          date: data.preferredDate || '',
          time: data.preferredTime || '',
          status: data.status === 'pending' ? 'Beklemede' : 
                  data.status === 'confirmed' ? 'Onaylandı' : 
                  data.status === 'cancelled' ? 'İptal' : 'Beklemede',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        };
      }).sort((a: any, b: any) => {
        // Tarihe göre sırala (en yakın önce)
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
      
      setAppointments(bookings);
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Fallback: AsyncStorage'dan yükle
      try {
        const appointmentsData = await AsyncStorage.getItem('appointments');
        if (appointmentsData) {
          const parsed = JSON.parse(appointmentsData);
          const shopData = await AsyncStorage.getItem('shopInfo');
          if (shopData) {
            const parsedShop = JSON.parse(shopData);
            const shopAppointments = parsed.filter((apt: any) => 
              apt.shopName === parsedShop.name
            ).sort((a: any, b: any) => {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
            setAppointments(shopAppointments);
          } else {
            setAppointments([]);
          }
        } else {
          setAppointments([]);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setAppointments([]);
      }
    }
  };

  const modifyAppointment = async (appointment: any) => {
    // Randevu değiştirme ekranına yönlendir
    let appointmentShopId = appointment.shopId || appointment.shopSlug;
    
    // Eğer shopId yoksa, shopName ile Firestore'da ara
    if (!appointmentShopId && appointment.shopName) {
      try {
        const shopsQuery = query(collection(db, 'shops'), where('name', '==', appointment.shopName));
        const snapshot = await getDocs(shopsQuery);
        if (!snapshot.empty) {
          const shopDoc = snapshot.docs[0];
          appointmentShopId = shopDoc.data().slug || shopDoc.id;
        }
      } catch (error) {
        console.error('Error finding shop by name:', error);
      }
    }
    
    if (!appointmentShopId) {
      Alert.alert('Hata', 'İşletme bilgisi bulunamadı. Randevu değiştirilemiyor.');
      return;
    }
    
    router.push({
      pathname: '/booking',
      params: {
        shopId: appointmentShopId,
        appointmentId: appointment.id,
        modifyMode: 'true',
      },
    });
  };

  const updateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      // Firestore'u güncelle
      const statusMap: { [key: string]: string } = {
        'Onaylandı': 'confirmed',
        'İptal': 'cancelled',
        'Tamamlandı': 'completed',
        'Beklemede': 'pending',
      };
      
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, {
        status: statusMap[newStatus] || 'pending',
        updatedAt: serverTimestamp(),
      });

      // AsyncStorage'ı da güncelle (fallback)
      const appointmentsData = await AsyncStorage.getItem('appointments');
      if (appointmentsData) {
        const parsed = JSON.parse(appointmentsData);
        const updated = parsed.map((apt: any) => 
          apt.id === id ? { ...apt, status: newStatus } : apt
        );
        await AsyncStorage.setItem('appointments', JSON.stringify(updated));
      }

      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Hata', 'Randevu durumu güncellenirken bir hata oluştu');
    }
  };

  const handleStatusChange = (appointment: any, newStatus: string) => {
    const statusText = newStatus === 'Onaylandı' ? 'onaylamak' : 
                      newStatus === 'İptal' ? 'iptal etmek' : 
                      'tamamlamak';
    
    Alert.alert(
      'Durum Değiştir',
      `Bu randevuyu ${statusText} istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Evet', 
          onPress: () => updateAppointmentStatus(appointment.id, newStatus)
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onaylandı':
        return '#10b981';
      case 'Beklemede':
        return '#f59e0b';
      case 'İptal':
        return '#ef4444';
      case 'Tamamlandı':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
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
        <Text style={styles.title}>Randevu Yönetimi</Text>
        <View style={styles.headerSpacer} />
      </View>

      {!shopName ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="exclamationmark.triangle" size={60} color="#f59e0b" />
          <Text style={styles.emptyTitle}>Dükkan bilgisi bulunamadı</Text>
          <Text style={styles.emptySubtitle}>
            Randevu yönetimi için önce dükkan bilgilerinizi ekleyin
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/admin/shop-info')}
          >
            <Text style={styles.exploreButtonText}>Dükkan Bilgileri</Text>
          </TouchableOpacity>
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="calendar" size={60} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Henüz randevu yok</Text>
          <Text style={styles.emptySubtitle}>
            Dükkanınıza henüz randevu alınmamış
          </Text>
        </View>
      ) : (
        <View style={styles.appointmentsList}>
          {appointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.shopInfo}>
                  <View style={styles.shopIcon}>
                    <IconSymbol name="person.fill" size={24} color="#ef4444" />
                  </View>
                  <View style={styles.shopDetails}>
                    <Text style={styles.serviceName}>{appointment.service}</Text>
                    <Text style={styles.dateTime}>
                      {formatDate(appointment.date)} • {appointment.time}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                    {appointment.status}
                  </Text>
                </View>
              </View>
              
              {appointment.shopAddress && (
                <View style={styles.addressRow}>
                  <IconSymbol name="location" size={14} color="#64748b" />
                  <Text style={styles.addressText}>{appointment.shopAddress}</Text>
                </View>
              )}

              {appointment.status !== 'Tamamlandı' && appointment.status !== 'İptal' && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.modifyButton]}
                    onPress={() => modifyAppointment(appointment)}
                  >
                    <IconSymbol name="pencil" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Değiştir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleStatusChange(appointment, 'İptal')}
                  >
                    <IconSymbol name="xmark.circle.fill" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>İptal Et</Text>
                  </TouchableOpacity>
                  {appointment.status === 'Onaylandı' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.completeButton]}
                      onPress={() => handleStatusChange(appointment, 'Tamamlandı')}
                    >
                      <IconSymbol name="checkmark.seal.fill" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Tamamlandı</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
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
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentsList: {
    padding: 20,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shopInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  shopIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shopDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  addressText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#64748b',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  modifyButton: {
    backgroundColor: '#2563eb',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  completeButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
