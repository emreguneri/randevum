import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ActiveAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [recurringGroups, setRecurringGroups] = useState<{ [key: string]: any[] }>({});
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [user])
  );

  const loadAppointments = async () => {
    try {
      // Firestore'dan randevuları yükle
      let bookingsQuery;
      
      if (user?.uid) {
        // Giriş yapmış kullanıcı - kendi randevularını getir
        bookingsQuery = query(collection(db, 'bookings'), where('customerId', '==', user.uid));
      } else {
        // Guest mode - email ile ara
        const guestEmail = await AsyncStorage.getItem('guestEmail');
        if (guestEmail) {
          bookingsQuery = query(collection(db, 'bookings'), where('customerEmail', '==', guestEmail));
        } else {
          // Email yoksa AsyncStorage'dan yükle (fallback)
          const appointmentsData = await AsyncStorage.getItem('appointments');
          if (appointmentsData) {
            const parsed = JSON.parse(appointmentsData);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const active = parsed.filter((apt: any) => {
              const aptDate = new Date(apt.date);
              aptDate.setHours(0, 0, 0, 0);
              return aptDate >= today && apt.status !== 'Tamamlandı' && apt.status !== 'İptal';
            }).sort((a: any, b: any) => {
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            });
            
            setAppointments(active);
            return;
          } else {
            setAppointments([]);
            return;
          }
        }
      }

      const snapshot = await getDocs(bookingsQuery);
      const bookings = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          shopId: data.shopId || data.shopSlug || '',
          shopSlug: data.shopSlug || data.shopId || '',
          shopName: data.shopName || '',
          shopAddress: data.branch || '',
          service: data.service || '',
          date: data.preferredDate || '',
          time: data.preferredTime || '',
          status: data.status === 'pending' ? 'Beklemede' : 
                  data.status === 'confirmed' ? 'Onaylandı' : 
                  data.status === 'cancelled' ? 'İptal' : 'Beklemede',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          recurringGroupId: data.recurringGroupId || null,
        };
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Aktif randevular (bugünden sonraki veya bugünkü, tamamlanmamış)
      const active = bookings.filter((apt: any) => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate >= today && apt.status !== 'Tamamlandı' && apt.status !== 'İptal';
      }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Tekrarlayan randevuları grupla
      const groups: { [key: string]: any[] } = {};
      const standalone: any[] = [];
      
      active.forEach((apt: any) => {
        if (apt.recurringGroupId) {
          if (!groups[apt.recurringGroupId]) {
            groups[apt.recurringGroupId] = [];
          }
          groups[apt.recurringGroupId].push(apt);
        } else {
          standalone.push(apt);
        }
      });
      
      setRecurringGroups(groups);
      setAppointments(standalone);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onaylandı':
        return '#10b981';
      case 'Beklemede':
        return '#f59e0b';
      case 'İptal':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Aktif Randevular</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="calendar" size={60} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Aktif randevunuz yok</Text>
          <Text style={styles.emptySubtitle}>
            Henüz aktif randevunuz bulunmamaktadır
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/index')}
          >
            <Text style={styles.exploreButtonText}>Randevu Al</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.appointmentsList}>
          {/* Tekrarlayan Randevular */}
          {Object.keys(recurringGroups).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tekrarlayan Randevular</Text>
              {Object.entries(recurringGroups).map(([groupId, groupAppointments]) => (
                <View key={groupId} style={styles.recurringGroup}>
                  <View style={styles.recurringHeader}>
                    <IconSymbol name="repeat" size={20} color="#3b82f6" />
                    <Text style={styles.recurringTitle}>
                      {groupAppointments.length} Randevu
                    </Text>
                  </View>
                  {groupAppointments.map((appointment) => (
                    <View key={appointment.id} style={[styles.appointmentCard, styles.recurringCard]}>
                      <View style={styles.cardHeader}>
                        <View style={styles.shopInfo}>
                          <View style={styles.shopIcon}>
                            <IconSymbol name="scissors" size={24} color="#ef4444" />
                          </View>
                          <View style={styles.shopDetails}>
                            <Text style={styles.shopName}>{appointment.shopName}</Text>
                            {appointment.shopAddress && (
                              <Text style={styles.shopAddress}>{appointment.shopAddress}</Text>
                            )}
                          </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                            {appointment.status}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.cardBody}>
                        <View style={styles.infoRow}>
                          <IconSymbol name="scissors" size={16} color="#64748b" />
                          <Text style={styles.infoText}>{appointment.service}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <IconSymbol name="calendar" size={16} color="#64748b" />
                          <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <IconSymbol name="clock" size={16} color="#64748b" />
                          <Text style={styles.infoText}>{appointment.time}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
          
          {/* Normal Randevular */}
          {appointments.length > 0 && (
            <View style={styles.section}>
              {Object.keys(recurringGroups).length > 0 && (
                <Text style={styles.sectionTitle}>Diğer Randevular</Text>
              )}
              {appointments.map((appointment) => (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.shopInfo}>
                      <View style={styles.shopIcon}>
                        <IconSymbol name="scissors" size={24} color="#ef4444" />
                      </View>
                      <View style={styles.shopDetails}>
                        <Text style={styles.shopName}>{appointment.shopName}</Text>
                        {appointment.shopAddress && (
                          <Text style={styles.shopAddress}>{appointment.shopAddress}</Text>
                        )}
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                        {appointment.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <IconSymbol name="scissors" size={16} color="#64748b" />
                      <Text style={styles.infoText}>{appointment.service}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <IconSymbol name="calendar" size={16} color="#64748b" />
                      <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <IconSymbol name="clock" size={16} color="#64748b" />
                      <Text style={styles.infoText}>{appointment.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {appointments.length === 0 && Object.keys(recurringGroups).length === 0 && (
            <View style={styles.emptyContainer}>
              <IconSymbol name="calendar" size={60} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>Aktif randevunuz yok</Text>
              <Text style={styles.emptySubtitle}>
                Henüz aktif randevunuz bulunmamaktadır
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/index')}
              >
                <Text style={styles.exploreButtonText}>Randevu Al</Text>
              </TouchableOpacity>
            </View>
          )}
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
    padding: 20,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    textAlign: 'center',
    flex: 1,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  recurringGroup: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recurringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  recurringTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 8,
  },
  recurringCard: {
    marginBottom: 12,
    marginTop: 0,
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
    marginBottom: 16,
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
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 13,
    color: '#64748b',
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
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
});

