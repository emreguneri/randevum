import { AnimatedTabScreen } from '@/components/animated-tab-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Takvim Görünümü Komponenti
function CalendarView({ 
  appointments, 
  formatDate, 
  getStatusColor, 
  handleStatusChange,
  modifyAppointment
}: { 
  appointments: any[];
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  handleStatusChange: (appointment: any, status: string) => void;
  modifyAppointment: (appointment: any) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Haftalık takvim oluştur
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  
  // Seçilen günün randevularını filtrele
  const selectedDayAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.date).toISOString().split('T')[0];
    return aptDate === selectedDate;
  });

  // Tarihe göre randevu sayısını al
  const getAppointmentCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt: any) => {
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      return aptDate === dateStr;
    }).length;
  };

  // Bugün mü kontrolü
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Seçilen gün mü kontrolü
  const isSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === selectedDate;
  };

  return (
    <View>
      {/* Haftalık Takvim */}
      <View style={styles.calendarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayNumber = date.getDate();
            const appointmentCount = getAppointmentCount(date);
            const isSelectedDay = isSelected(date);
            const isTodayDate = isToday(date);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  isSelectedDay && styles.calendarDaySelected,
                  isTodayDate && !isSelectedDay && styles.calendarDayToday
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[
                  styles.calendarDayName,
                  isSelectedDay && styles.calendarDayNameSelected
                ]}>
                  {dayNames[index]}
                </Text>
                <Text style={[
                  styles.calendarDayNumber,
                  isSelectedDay && styles.calendarDayNumberSelected
                ]}>
                  {dayNumber}
                </Text>
                {appointmentCount > 0 && (
                  <View style={[
                    styles.calendarBadge,
                    isSelectedDay && styles.calendarBadgeSelected
                  ]}>
                    <Text style={[
                      styles.calendarBadgeText,
                      isSelectedDay && styles.calendarBadgeTextSelected
                    ]}>
                      {appointmentCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Seçilen Günün Randevuları */}
      <View style={styles.selectedDayAppointments}>
        <Text style={styles.selectedDayTitle}>
          {formatDate(selectedDate)} Randevuları
        </Text>
        {selectedDayAppointments.length === 0 ? (
          <View style={styles.emptyCalendarState}>
            <IconSymbol name="calendar.badge.exclamationmark" size={40} color="#cbd5e1" />
            <Text style={styles.emptyCalendarText}>Bu gün için randevu yok</Text>
          </View>
        ) : (
          selectedDayAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.calendarAppointmentCard}>
              <View style={styles.calendarAppointmentHeader}>
                <View style={styles.calendarAppointmentInfo}>
                  <Text style={styles.calendarAppointmentService}>{appointment.service}</Text>
                  <View style={styles.calendarAppointmentTimeRow}>
                    <IconSymbol name="clock" size={14} color="#64748b" />
                    <Text style={styles.calendarAppointmentTime}>{appointment.time}</Text>
                  </View>
                </View>
                <View style={[styles.calendarStatusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                  <Text style={[styles.calendarStatusText, { color: getStatusColor(appointment.status) }]}>
                    {appointment.status}
                  </Text>
                </View>
              </View>
              
              {appointment.status !== 'Tamamlandı' && appointment.status !== 'İptal' && (
                <View style={styles.calendarAppointmentActions}>
                  <TouchableOpacity 
                    style={[styles.calendarActionButton, styles.calendarModifyButton]}
                    onPress={() => modifyAppointment(appointment)}
                  >
                    <IconSymbol name="pencil" size={14} color="#fff" />
                    <Text style={styles.calendarActionButtonText}>Değiştir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.calendarActionButton, styles.calendarCancelButton]}
                    onPress={() => handleStatusChange(appointment, 'İptal')}
                  >
                    <IconSymbol name="xmark.circle.fill" size={14} color="#fff" />
                    <Text style={styles.calendarActionButtonText}>İptal</Text>
                  </TouchableOpacity>
                  {appointment.status === 'Onaylandı' && (
                    <TouchableOpacity 
                      style={[styles.calendarActionButton, styles.calendarCompleteButton]}
                      onPress={() => handleStatusChange(appointment, 'Tamamlandı')}
                    >
                      <IconSymbol name="checkmark.seal.fill" size={14} color="#fff" />
                      <Text style={styles.calendarActionButtonText}>Tamamlandı</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, profile, guestMode, setGuestMode } = useAuth();
  const [userType, setUserType] = useState<'customer' | 'admin'>('customer'); // 'customer' veya 'admin'
  
  // Guest mode'da önceki kullanıcı bilgilerini gösterme
  const userDisplayName = guestMode 
    ? 'Misafir Kullanıcı'
    : (user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı');

  const [shopData, setShopData] = useState({
    name: '',
    address: '',
    phone: '',
    category: 'Berber',
    workingHours: '',
    totalCustomers: 156,
    monthlyRevenue: '₺8,500',
    rating: 4.8,
  });

  const [activeAppointments, setActiveAppointments] = useState<any[]>([]);
  const [pastAppointments, setPastAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    favoriteShops: 0,
    averageRating: 0,
  });
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    paymentStatus: 'active' | 'inactive';
    daysRemaining: number | null;
    subscriptionEndDate: string | null;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Guest mode'da bazı işlemleri atla
      if (guestMode) {
        setUserType('customer');
        return;
      }
      
      // Kullanıcı giriş yapmışsa ve profile yüklenmişse, önce role kontrolü yap
      if (user && profile) {
        // İşletme sahibi olmak için: role === 'admin' VE subscriptionStatus === 'active'
        if (profile.role === 'admin' && profile.subscriptionStatus === 'active') {
          setUserType('admin');
          AsyncStorage.setItem('selectedUserType', 'admin').catch(() => {});
          // Admin ise diğer işlemleri yap
          loadSubscriptionInfo();
          loadShopInfo();
          loadAppointments();
          return;
        }
      }
      
      // Profile henüz yüklenmemişse veya aktif abonelik yoksa, normal akışı takip et
      loadUserTypePreference();
      loadSubscriptionInfo();
      loadShopInfo();
      loadAppointments();
      loadStats();
    }, [guestMode, user, profile])
  );

  // Kullanıcının seçimini AsyncStorage'dan yükle
  const loadUserTypePreference = async () => {
    try {
      // İşletme sahibi olmak için: role === 'admin' VE subscriptionStatus === 'active'
      // Sadece aktif aboneliği olanlar admin olarak görünür
      if (profile?.role === 'admin' && profile?.subscriptionStatus === 'active') {
        setUserType('admin');
        await AsyncStorage.setItem('selectedUserType', 'admin');
        return;
      }
      
      // Eğer aktif abonelik yoksa, otomatik kontrol yap
      await checkUserType();
    } catch (error) {
      console.error('Error loading user type preference:', error);
      // Hata durumunda varsayılan olarak müşteri
      setUserType('customer');
    }
  };

  const checkUserType = async () => {
    try {
      // İşletme sahibi olmak için: role === 'admin' VE subscriptionStatus === 'active'
      
      // Önce Firestore'dan kontrol et
      if (user?.uid) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Sadece aktif aboneliği olanlar işletme sahibi olarak görünür
          if (userData.role === 'admin' && userData.subscriptionStatus === 'active') {
            setUserType('admin');
            await AsyncStorage.setItem('selectedUserType', 'admin');
            return;
          }
        }
      }

      // AsyncStorage'dan businessOwner kontrolü yap (ödeme yapılmış işletme sahipleri)
      const businessOwner = await AsyncStorage.getItem('businessOwner');
      if (businessOwner) {
        const parsed = JSON.parse(businessOwner);
        if (parsed.paymentStatus === 'active') {
          setUserType('admin');
          await AsyncStorage.setItem('selectedUserType', 'admin');
          return;
        }
      }
      
      // Aktif abonelik yoksa müşteri olarak göster
      setUserType('customer');
      await AsyncStorage.setItem('selectedUserType', 'customer');
    } catch (error) {
      console.error('Error checking user type:', error);
      setUserType('customer');
      await AsyncStorage.setItem('selectedUserType', 'customer');
    }
  };

  const loadSubscriptionInfo = async () => {
    try {
      if (user?.uid) {
        // Önce users koleksiyonundan kontrol et
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('[Profile] User data for subscription:', userData);
          
          // Eğer subscriptionStatus active ise
          if (userData.subscriptionStatus === 'active') {
            // subscriptions koleksiyonundan detaylı bilgi al
            const subscriptionsQuery = query(
              collection(db, 'subscriptions'),
              where('userId', '==', user.uid)
            );
            const subscriptionsSnap = await getDocs(subscriptionsQuery);
            
            if (!subscriptionsSnap.empty) {
              const subData = subscriptionsSnap.docs[0].data();
              console.log('[Profile] Subscription data:', subData);
              
              const endDateRaw = subData.endDate;
              let endDate: Date | null = null;
              
              if (endDateRaw?.toDate) {
                endDate = endDateRaw.toDate();
              } else if (typeof endDateRaw === 'string') {
                endDate = new Date(endDateRaw);
              }
              
              if (endDate) {
                const today = new Date();
                const diffTime = endDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                setSubscriptionInfo({
                  paymentStatus: 'active',
                  daysRemaining: diffDays > 0 ? diffDays : 0,
                  subscriptionEndDate: endDate.toLocaleDateString('tr-TR'),
                });
                return;
              }
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
              return;
            }
            
            // Tarih bilgisi yoksa sadece active göster
            setSubscriptionInfo({
              paymentStatus: 'active',
              daysRemaining: null,
              subscriptionEndDate: null,
            });
            return;
          }
        }
      }

      const businessOwner = await AsyncStorage.getItem('businessOwner');
      if (businessOwner) {
        const parsed = JSON.parse(businessOwner);
        if (parsed.paymentStatus === 'active' && parsed.subscriptionEndDate) {
          const endDate = new Date(parsed.subscriptionEndDate);
          const today = new Date();
          const diffTime = endDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setSubscriptionInfo({
            paymentStatus: 'active',
            daysRemaining: diffDays > 0 ? diffDays : 0,
            subscriptionEndDate: endDate.toLocaleDateString('tr-TR'),
          });
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
    }
  };

  const loadShopInfo = async () => {
    try {
      const shopInfo = await AsyncStorage.getItem('shopInfo');
      if (shopInfo) {
        const parsed = JSON.parse(shopInfo);
        setShopData((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          address: parsed.address || prev.address,
          phone: parsed.phone || prev.phone,
          workingHours: parsed.workingHours || prev.workingHours,
        }));
      } else {
        setShopData((prev) => ({
          ...prev,
          name: '',
          address: '',
          phone: '',
          workingHours: '',
        }));
      }
    } catch (error) {
      console.error('Error loading shop info:', error);
    }
  };

  const handleBusinessOwnerToggle = async () => {
    // Misafir kullanıcı veya giriş yapmamış kullanıcı kontrolü
    if (guestMode || !user) {
      Alert.alert(
        'İşletme Sahibi Hesabı Gerekli',
        'İşletme sahibi özelliklerini kullanmak için işletme sahibi hesabı ile giriş yapmanız gerekmektedir.',
        [
          {
            text: 'Vazgeç',
            style: 'cancel',
          },
          {
            text: 'Kayıt Ol',
            onPress: () => {
              // Modal kapanması için kısa bir bekleme
              setTimeout(() => {
                router.replace('/register');
              }, 100);
            },
            style: 'default',
          },
          {
            text: 'Giriş Yap',
            onPress: () => {
              // Modal kapanması için kısa bir bekleme
              setTimeout(() => {
                router.replace('/login');
              }, 100);
            },
            style: 'default',
          },
        ]
      );
      return;
    }

    // Önce Firestore'dan güncel kullanıcı bilgisini al
    let isAdmin = false;
    let hasActiveSubscription = false;

    if (user?.uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('[Profile] User data from Firestore:', userData);
          
          // Role kontrolü
          if (userData.role === 'admin') {
            isAdmin = true;
          }
          
          // Subscription kontrolü
          if (userData.subscriptionStatus === 'active') {
            hasActiveSubscription = true;
          }
        }
      } catch (error) {
        console.error('[Profile] Error fetching user data:', error);
      }
    }

    // Sadece aktif aboneliği olanlar işletme sahibi moduna geçebilir
    // Role admin olsa bile subscription active olmalı
    if (hasActiveSubscription) {
      console.log('[Profile] User has active subscription, switching to admin mode');
      setUserType('admin');
      await AsyncStorage.setItem('selectedUserType', 'admin');
      return;
    }

    // AsyncStorage'dan da kontrol et
    if (!hasActiveSubscription) {
      const businessOwner = await AsyncStorage.getItem('businessOwner');
      if (businessOwner) {
        const parsed = JSON.parse(businessOwner);
        if (parsed.paymentStatus === 'active') {
          hasActiveSubscription = true;
        }
      }
    }

    if (!hasActiveSubscription) {
      // Ödeme yapılmamış - ödeme ekranına yönlendir
      const pendingBusinessOwner = await AsyncStorage.getItem('pendingBusinessOwner');
      const userEmail = user?.email || '';
      const userName = user?.displayName || userEmail.split('@')[0] || '';
      
      let email = userEmail;
      let name = userName;
      
      if (pendingBusinessOwner) {
        const parsed = JSON.parse(pendingBusinessOwner);
        email = parsed.email || email;
        name = parsed.name || name;
      }
      
      router.push({
        pathname: '/payment',
        params: {
          email,
          name,
          userType: 'business'
        }
      });
      return;
    }

    // Ödeme yapılmış - işletme sahibi moduna geç
    setUserType('admin');
    await AsyncStorage.setItem('selectedUserType', 'admin');
  };

  const handleAddShop = async () => {
    // Ödeme kontrolü yap
    let hasActiveSubscription = false;

    if (user?.uid) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.subscriptionStatus === 'active') {
          hasActiveSubscription = true;
        }
      }
    }

    if (!hasActiveSubscription) {
      const businessOwner = await AsyncStorage.getItem('businessOwner');
      if (businessOwner) {
        const parsed = JSON.parse(businessOwner);
        if (parsed.paymentStatus === 'active') {
          hasActiveSubscription = true;
        }
      }
    }

    if (!hasActiveSubscription) {
      // Ödeme yapılmamış - ödeme ekranına yönlendir
      const userEmail = user?.email || '';
      const userName = user?.displayName || userEmail.split('@')[0] || '';
      
      router.push({
        pathname: '/payment',
        params: {
          email: userEmail,
          name: userName,
          userType: 'business'
        }
      });
      return;
    }

    // Ödeme yapılmış - mekan ekleme sayfasına git
    router.push('/admin/shop-info');
  };

  const loadStats = async () => {
    try {
      if (!user?.uid) {
        // Giriş yapmamış kullanıcı için boş stats
        setStats({
          totalAppointments: 0,
          favoriteShops: 0,
          averageRating: 0,
        });
        return;
      }

      // Toplam randevu sayısı - Firestore'dan
      const bookingsQuery = query(collection(db, 'bookings'), where('customerId', '==', user.uid));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const totalAppointments = bookingsSnapshot.size;

      // Favori dükkan sayısı - Firestore'dan
      const favoritesQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoriteShops = favoritesSnapshot.size;

      // Ortalama puan - Kullanıcının aldığı randevulara verilen puanların ortalaması
      let averageRating = 0;
      try {
        const reviewsQuery = query(collection(db, 'reviews'), where('customerId', '==', user.uid));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        if (reviewsSnapshot.size > 0) {
          const ratings = reviewsSnapshot.docs.map(doc => {
            const data = doc.data();
            return data.rating || 0;
          }).filter(rating => rating > 0);
          
          if (ratings.length > 0) {
            const sum = ratings.reduce((acc, rating) => acc + rating, 0);
            averageRating = sum / ratings.length;
          }
        }
      } catch (reviewError) {
        console.error('Error loading reviews:', reviewError);
        averageRating = 0;
      }

      setStats({
        totalAppointments,
        favoriteShops,
        averageRating: Math.round(averageRating * 10) / 10, // 1 ondalık basamak
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalAppointments: 0,
        favoriteShops: 0,
        averageRating: 0,
      });
    }
  };

  const loadAppointments = async () => {
    try {
      // Giriş yapmış kullanıcı için sadece Firestore'dan yükle
      if (user?.uid) {
        // Giriş yapmış kullanıcı - kendi randevularını getir (sadece customerId ile eşleşenler)
        const bookingsQuery = query(collection(db, 'bookings'), where('customerId', '==', user.uid));
        
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
        }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 2);
        
        // Geçmiş randevular (bugünden önceki veya tamamlanmış)
        const past = bookings.filter((apt: any) => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate < today || apt.status === 'Tamamlandı' || apt.status === 'İptal';
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
        
        setActiveAppointments(active);
        setPastAppointments(past);
        return;
      }
      
      // Guest mode - email ile ara
      const guestEmail = await AsyncStorage.getItem('guestEmail');
      if (guestEmail) {
        const bookingsQuery = query(collection(db, 'bookings'), where('customerEmail', '==', guestEmail));
        
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
        }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 2);
        
        // Geçmiş randevular (bugünden önceki veya tamamlanmış)
        const past = bookings.filter((apt: any) => {
          const aptDate = new Date(apt.date);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate < today || apt.status === 'Tamamlandı' || apt.status === 'İptal';
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
        
        setActiveAppointments(active);
        setPastAppointments(past);
        return;
      }
      
      // Guest mode ve email yoksa - boş liste
      setActiveAppointments([]);
      setPastAppointments([]);
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Hata durumunda boş liste göster (giriş yapmış kullanıcılar için AsyncStorage fallback yok)
      setActiveAppointments([]);
      setPastAppointments([]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const cancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Randevu İptal',
      'Bu randevuyu iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              // Firestore'u güncelle
              const bookingRef = doc(db, 'bookings', appointmentId);
              await updateDoc(bookingRef, {
                status: 'cancelled',
                updatedAt: serverTimestamp(),
              });

              // AsyncStorage'ı da güncelle (fallback)
              const appointmentsData = await AsyncStorage.getItem('appointments');
              if (appointmentsData) {
                const parsed = JSON.parse(appointmentsData);
                const updated = parsed.map((apt: any) =>
                  apt.id === appointmentId ? { ...apt, status: 'İptal' } : apt
                );
                await AsyncStorage.setItem('appointments', JSON.stringify(updated));
              }

              loadAppointments();
              Alert.alert('Başarılı', 'Randevu iptal edildi');
            } catch (error) {
              console.error('Error canceling appointment:', error);
              Alert.alert('Hata', 'Randevu iptal edilirken bir hata oluştu');
            }
          },
        },
      ]
    );
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

  const reviewAppointment = (appointment: any) => {
    Alert.alert(
      'Değerlendirme',
      `${appointment.shopName} hizmetini nasıl değerlendirirsiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: '5 Yıldız',
          onPress: () => saveReview(appointment, 5, ''),
        },
        {
          text: '4 Yıldız',
          onPress: () => saveReview(appointment, 4, ''),
        },
        {
          text: '3 Yıldız',
          onPress: () => saveReview(appointment, 3, ''),
        },
        {
          text: '2 Yıldız',
          onPress: () => saveReview(appointment, 2, ''),
        },
        {
          text: '1 Yıldız',
          onPress: () => saveReview(appointment, 1, ''),
        },
      ]
    );
  };

  const saveReview = async (appointment: any, rating: number, comment: string) => {
    try {
      // Şimdilik basit bir kayıt, gelecekte reviews AsyncStorage'a kaydedilebilir
      Alert.alert(
        'Başarılı',
        `Değerlendirmeniz kaydedildi. ${rating} yıldız verdiniz.`,
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Error saving review:', error);
      Alert.alert('Hata', 'Değerlendirme kaydedilirken bir hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onaylandı':
        return '#10b981';
      case 'Beklemede':
        return '#f59e0b';
      case 'Tamamlandı':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Onaylandı':
        return 'checkmark.circle.fill';
      case 'Beklemede':
        return 'clock.fill';
      case 'Tamamlandı':
        return 'checkmark.circle';
      default:
        return 'circle';
    }
  };

  const handleStatusChange = async (appointment: any, newStatus: string) => {
    try {
      // Firestore'u güncelle
      const statusMap: { [key: string]: string } = {
        'Onaylandı': 'confirmed',
        'İptal': 'cancelled',
        'Tamamlandı': 'completed',
        'Beklemede': 'pending',
      };
      
      const bookingRef = doc(db, 'bookings', appointment.id);
      await updateDoc(bookingRef, {
        status: statusMap[newStatus] || newStatus.toLowerCase(),
        updatedAt: serverTimestamp(),
      });

      // AsyncStorage'ı da güncelle (fallback)
      const appointmentsData = await AsyncStorage.getItem('appointments');
      if (appointmentsData) {
        const parsed = JSON.parse(appointmentsData);
        const updated = parsed.map((apt: any) =>
          apt.id === appointment.id ? { ...apt, status: newStatus } : apt
        );
        await AsyncStorage.setItem('appointments', JSON.stringify(updated));
      }

      loadAppointments();
      Alert.alert('Başarılı', `Randevu ${newStatus} olarak güncellendi`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Hata', 'Randevu durumu güncellenirken bir hata oluştu');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              // Eğer kullanıcı giriş yapmışsa Firebase'den çıkış yap
              if (user) {
                await logout();
              }
              
              // AsyncStorage'dan kullanıcı verilerini temizle
              await AsyncStorage.removeItem('selectedUserType');
              await AsyncStorage.removeItem('businessOwner');
              await AsyncStorage.removeItem('shopInfo');
              await AsyncStorage.removeItem('pendingBusinessOwner');
              
              // Misafir moduna dön
              await setGuestMode(true);
              
              // State'lerin güncellenmesi için bekleme (onAuthStateChanged'in tetiklenmesi için)
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Ana sayfaya yönlendir - misafir modunda
              router.replace('/(tabs)');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  return (
    <AnimatedTabScreen>
      <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Profilim</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* User Info Card (Compact) */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <IconSymbol
            name={userType === 'admin' ? 'building.2.fill' : 'person.fill'}
            size={20}
            color="#ef4444"
          />
        </View>
        <Text style={styles.userName} numberOfLines={1}>
          {userType === 'admin' && subscriptionInfo?.paymentStatus === 'active' && shopData.name
            ? shopData.name
            : userDisplayName}
        </Text>
      </View>

      {/* User Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, userType === 'customer' && styles.activeToggle]}
          onPress={async () => {
            // Misafir kullanıcı veya giriş yapmamış kullanıcı kontrolü
            if (guestMode || !user) {
              Alert.alert(
                'Müşteri Hesabı Gerekli',
                'Müşteri özelliklerini kullanmak için müşteri hesabı ile giriş yapmanız gerekmektedir.',
                [
                  {
                    text: 'Vazgeç',
                    style: 'cancel',
                  },
                  {
                    text: 'Kayıt Ol',
                    onPress: () => {
                      setTimeout(() => {
                        router.replace('/register');
                      }, 100);
                    },
                    style: 'default',
                  },
                  {
                    text: 'Giriş Yap',
                    onPress: () => {
                      setTimeout(() => {
                        router.replace('/login');
                      }, 100);
                    },
                    style: 'default',
                  },
                ]
              );
              return;
            }
            
            // Giriş yapmış kullanıcı için userType'ı güncelle
            setUserType('customer');
            await AsyncStorage.setItem('selectedUserType', 'customer');
          }}
        >
          <IconSymbol name="person" size={16} color={userType === 'customer' ? '#fff' : '#64748b'} />
          <Text style={[styles.toggleText, userType === 'customer' && styles.activeToggleText]}>
            Müşteri
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, userType === 'admin' && styles.activeToggle]}
          onPress={handleBusinessOwnerToggle}
        >
          <IconSymbol name="building.2" size={16} color={userType === 'admin' ? '#fff' : '#64748b'} />
          <Text style={[styles.toggleText, userType === 'admin' && styles.activeToggleText]}>
            İşletme Sahibi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats - Sadece Giriş Yapmış Müşteri için */}
      {userType === 'customer' && !guestMode && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalAppointments}</Text>
            <Text style={styles.statLabel}>Toplam Randevu</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.favoriteShops}</Text>
            <Text style={styles.statLabel}>Favori Dükkan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.statLabel}>Ortalama Puan</Text>
          </View>
        </View>
      )}

      {/* İşletme Sahibi - Abonelik Bilgileri */}
      {userType === 'admin' && !guestMode && (
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <IconSymbol name="crown.fill" size={20} color="#f59e0b" />
            <Text style={styles.subscriptionTitle}>Abonelik Durumu</Text>
          </View>
          
          <View style={styles.subscriptionContent}>
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Durum:</Text>
              <View style={[
                styles.subscriptionBadge,
                { backgroundColor: subscriptionInfo?.paymentStatus === 'active' ? '#10b98120' : '#ef444420' }
              ]}>
                <Text style={[
                  styles.subscriptionBadgeText,
                  { color: subscriptionInfo?.paymentStatus === 'active' ? '#10b981' : '#ef4444' }
                ]}>
                  {subscriptionInfo?.paymentStatus === 'active' ? 'Aktif' : 'Pasif'}
                </Text>
              </View>
            </View>
            
            {subscriptionInfo?.paymentStatus === 'active' && (
              <>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionLabel}>Kalan Gün:</Text>
                  <Text style={[
                    styles.subscriptionValue,
                    { color: (subscriptionInfo?.daysRemaining || 0) <= 7 ? '#f59e0b' : '#10b981' }
                  ]}>
                    {subscriptionInfo?.daysRemaining || 0} gün
                  </Text>
                </View>
                {subscriptionInfo?.subscriptionEndDate && (
                  <View style={styles.subscriptionRow}>
                    <Text style={styles.subscriptionLabel}>Bitiş Tarihi:</Text>
                    <Text style={styles.subscriptionValue}>
                      {subscriptionInfo.subscriptionEndDate}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {subscriptionInfo?.paymentStatus !== 'active' && (
            <TouchableOpacity 
              style={styles.subscriptionButton}
              onPress={() => router.push('/payment')}
            >
              <IconSymbol name="creditcard.fill" size={16} color="#fff" />
              <Text style={styles.subscriptionButtonText}>Abonelik Satın Al</Text>
            </TouchableOpacity>
          )}
          
          {subscriptionInfo?.paymentStatus === 'active' && (
            <TouchableOpacity 
              style={[styles.subscriptionButton, { backgroundColor: '#64748b' }]}
              onPress={() => router.push('/settings/subscription')}
            >
              <IconSymbol name="gearshape.fill" size={16} color="#fff" />
              <Text style={styles.subscriptionButtonText}>Abonelik Ayarları</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* İşletme Yönetimi - İşletme Sahibi için */}
      {userType === 'admin' && !guestMode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İşletme Yönetimi</Text>
          
          {subscriptionInfo?.paymentStatus === 'active' ? (
            <View style={styles.businessMenuContainer}>
              <TouchableOpacity 
                style={styles.businessMenuItem}
                onPress={handleAddShop}
              >
                <View style={[styles.businessMenuIcon, { backgroundColor: '#dc262620' }]}>
                  <IconSymbol name="plus.circle.fill" size={24} color="#dc2626" />
                </View>
                <View style={styles.businessMenuContent}>
                  <Text style={styles.businessMenuTitle}>Mekan Ekle / Düzenle</Text>
                  <Text style={styles.businessMenuSubtitle}>İşletme bilgilerinizi yönetin</Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.businessMenuItem}
                onPress={() => router.push('/admin/appointments')}
              >
                <View style={[styles.businessMenuIcon, { backgroundColor: '#3b82f620' }]}>
                  <IconSymbol name="calendar.badge.clock" size={24} color="#3b82f6" />
                </View>
                <View style={styles.businessMenuContent}>
                  <Text style={styles.businessMenuTitle}>Randevu Yönetimi</Text>
                  <Text style={styles.businessMenuSubtitle}>Gelen randevuları yönetin</Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.businessMenuItem}
                onPress={() => router.push('/admin/revenue')}
              >
                <View style={[styles.businessMenuIcon, { backgroundColor: '#10b98120' }]}>
                  <IconSymbol name="chart.bar.fill" size={24} color="#10b981" />
                </View>
                <View style={styles.businessMenuContent}>
                  <Text style={styles.businessMenuTitle}>Gelir & İstatistikler</Text>
                  <Text style={styles.businessMenuSubtitle}>Finansal raporlarınız</Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.businessMenuItem}
                onPress={() => router.push('/admin/staff')}
              >
                <View style={[styles.businessMenuIcon, { backgroundColor: '#8b5cf620' }]}>
                  <IconSymbol name="person.2.fill" size={24} color="#8b5cf6" />
                </View>
                <View style={styles.businessMenuContent}>
                  <Text style={styles.businessMenuTitle}>Personel Yönetimi</Text>
                  <Text style={styles.businessMenuSubtitle}>Çalışanlarınızı yönetin</Text>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.subscriptionRequiredCard}>
              <IconSymbol name="lock.fill" size={32} color="#94a3b8" />
              <Text style={styles.subscriptionRequiredTitle}>Abonelik Gerekli</Text>
              <Text style={styles.subscriptionRequiredText}>
                İşletme özelliklerini kullanmak için abonelik satın alın
              </Text>
              <TouchableOpacity 
                style={styles.subscriptionRequiredButton}
                onPress={() => router.push('/payment')}
              >
                <Text style={styles.subscriptionRequiredButtonText}>Abonelik Satın Al</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Active Appointments - Sadece giriş yapmış kullanıcılar için */}
      {!guestMode && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {userType === 'customer' ? 'Aktif Randevularım' : 'Randevu Takvimi'}
            </Text>
            {userType === 'customer' && (
              <TouchableOpacity onPress={() => router.push('/appointments/active')}>
                <Text style={styles.seeAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            )}
          </View>
        
        {userType === 'admin' && subscriptionInfo?.paymentStatus === 'active' ? (
          <CalendarView 
            appointments={activeAppointments}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            handleStatusChange={handleStatusChange}
            modifyAppointment={modifyAppointment}
          />
        ) : (
          <>
        
        {activeAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="calendar" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Aktif randevunuz yok</Text>
            <Text style={styles.emptySubtitle}>Yeni bir randevu almak için dükkanları keşfedin</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.exploreButtonText}>Dükkanları Keşfet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.shopName}>{appointment.shopName}</Text>
                  <Text style={styles.serviceName}>{appointment.service}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                  <IconSymbol 
                    name={getStatusIcon(appointment.status)} 
                    size={12} 
                    color={getStatusColor(appointment.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                    {appointment.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <IconSymbol name="calendar" size={14} color="#64748b" />
                  <Text style={styles.detailText}>{formatDate(appointment.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <IconSymbol name="clock" size={14} color="#64748b" />
                  <Text style={styles.detailText}>{appointment.time}</Text>
                </View>
              </View>
              
              <View style={styles.appointmentActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push(`/shop/${appointment.shopId || appointment.shopSlug || appointment.shopName}`)}
                >
                  <Text style={styles.actionButtonText}>Detay</Text>
                </TouchableOpacity>
                {/* Müşteriler randevu değiştirebilir */}
                <TouchableOpacity 
                  style={[styles.actionButton, styles.modifyButton]}
                  onPress={() => modifyAppointment(appointment)}
                >
                  <Text style={[styles.actionButtonText, styles.modifyButtonText]}>Değiştir</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => cancelAppointment(appointment.id)}
                >
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>İptal Et</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
          </>
        )}
        </View>
      )}

      {/* Past Appointments - Sadece giriş yapmış kullanıcılar için */}
      {!guestMode && (
        <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Geçmiş Randevularım</Text>
          <TouchableOpacity onPress={() => router.push('/appointments/history')}>
            <Text style={styles.seeAllText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        {pastAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="clock.arrow.circlepath" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Geçmiş randevunuz yok</Text>
          </View>
        ) : (
          pastAppointments.map((appointment) => (
            <View key={appointment.id} style={styles.pastAppointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.shopName}>{appointment.shopName}</Text>
                  <Text style={styles.serviceName}>{appointment.service}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
                  <IconSymbol 
                    name={getStatusIcon(appointment.status)} 
                    size={12} 
                    color={getStatusColor(appointment.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                    {appointment.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <IconSymbol name="calendar" size={14} color="#64748b" />
                  <Text style={styles.detailText}>{formatDate(appointment.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <IconSymbol name="clock" size={14} color="#64748b" />
                  <Text style={styles.detailText}>{appointment.time}</Text>
                </View>
              </View>
              
              <View style={styles.pastAppointmentActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/booking')}
                >
                  <Text style={styles.actionButtonText}>Tekrar Randevu Al</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.reviewButton]}
                  onPress={() => reviewAppointment(appointment)}
                >
                  <Text style={[styles.actionButtonText, styles.reviewButtonText]}>Değerlendir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        </View>
      )}

      {/* Admin Features - Sadece ödeme yapılmışsa göster */}
      {userType === 'admin' && subscriptionInfo?.paymentStatus === 'active' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İşletme Yönetimi</Text>
          
          <View style={styles.adminFeatures}>
            <TouchableOpacity style={styles.adminFeatureCard} onPress={() => router.push('/admin/appointments')}>
              <IconSymbol name="calendar.badge.plus" size={24} color="#ef4444" />
              <View style={styles.adminFeatureInfo}>
                <Text style={styles.adminFeatureTitle}>Randevu Yönetimi</Text>
                <Text style={styles.adminFeatureSubtitle}>Gelen randevuları yönetin</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#cbd5e1" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.adminFeatureCard} onPress={() => router.push('/admin/stats')}>
              <IconSymbol name="chart.bar" size={24} color="#10b981" />
              <View style={styles.adminFeatureInfo}>
                <Text style={styles.adminFeatureTitle}>İstatistikler</Text>
                <Text style={styles.adminFeatureSubtitle}>Gelir ve müşteri analizi</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#cbd5e1" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.adminFeatureCard} onPress={() => router.push('/admin/shop-info')}>
              <IconSymbol name="building.2" size={24} color="#f59e0b" />
              <View style={styles.adminFeatureInfo}>
                <Text style={styles.adminFeatureTitle}>Dükkan Bilgileri</Text>
                <Text style={styles.adminFeatureSubtitle}>Adres, saatler, hizmetler</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#cbd5e1" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.adminFeatureCard} onPress={() => router.push('/admin/reviews')}>
              <IconSymbol name="star" size={24} color="#8b5cf6" />
              <View style={styles.adminFeatureInfo}>
                <Text style={styles.adminFeatureTitle}>Değerlendirmeler</Text>
                <Text style={styles.adminFeatureSubtitle}>Müşteri yorumları ve puanlar</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ayarlar</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/notifications')}>
            <IconSymbol name="bell" size={20} color="#64748b" />
            <Text style={styles.settingText}>Bildirimler</Text>
            <IconSymbol name="chevron.right" size={16} color="#cbd5e1" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/privacy')}>
            <IconSymbol name="lock" size={20} color="#64748b" />
            <Text style={styles.settingText}>Gizlilik</Text>
            <IconSymbol name="chevron.right" size={16} color="#cbd5e1" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/help')}>
            <IconSymbol name="questionmark.circle" size={20} color="#64748b" />
            <Text style={styles.settingText}>Yardım</Text>
            <IconSymbol name="chevron.right" size={16} color="#cbd5e1" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/settings/about')}>
            <IconSymbol name="info.circle" size={20} color="#64748b" />
            <Text style={styles.settingText}>Hakkında</Text>
            <IconSymbol name="chevron.right" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Abonelik Bilgileri - İşletme Sahibi için (Sayfanın Altında) */}
      {userType === 'admin' && subscriptionInfo && subscriptionInfo.paymentStatus === 'active' && (
        <View style={styles.section}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#10b981" />
              <Text style={styles.subscriptionTitle}>Aktif Abonelik</Text>
            </View>
            {subscriptionInfo.daysRemaining !== null && (
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionDays}>
                  Aboneliğinizin bitmesine {subscriptionInfo.daysRemaining} gün kaldı
                </Text>
                {subscriptionInfo.daysRemaining <= 7 && (
                  <View style={styles.warningBadge}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#f59e0b" />
                    <Text style={styles.warningText}>Yakında yenileme gerekli</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={22} color="#fff" />
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 70,
    paddingBottom: 20,
    minHeight: 120,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  headerLeft: {
    width: 36,
    height: 36,
  },
  headerRight: {
    width: 36,
    height: 36,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 40,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutSection: {
    padding: 24,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  // info rows removed per simplified design
  memberSince: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  // edit button removed per simplified design
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  serviceName: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modifyButton: {
    borderColor: '#2563eb',
  },
  modifyButtonText: {
    color: '#2563eb',
  },
  cancelButton: {
    borderColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#ef4444',
  },
  pastAppointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pastAppointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewButton: {
    borderColor: '#ef4444',
  },
  reviewButtonText: {
    color: '#ef4444',
  },
  settingsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeToggleText: {
    color: '#fff',
  },
  adminFeatures: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  adminFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  adminFeatureInfo: {
    flex: 1,
    marginLeft: 16,
  },
  adminFeatureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  adminFeatureSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  addShopButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addShopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  subscriptionInfo: {
    gap: 8,
  },
  subscriptionDays: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 24,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  // Calendar View Styles
  calendarContainer: {
    marginBottom: 20,
  },
  calendarScroll: {
    paddingHorizontal: 4,
  },
  calendarDay: {
    width: 60,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  calendarDaySelected: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  calendarDayToday: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  calendarDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  calendarDayNameSelected: {
    color: '#fff',
  },
  calendarDayNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  calendarDayNumberSelected: {
    color: '#fff',
  },
  calendarBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarBadgeSelected: {
    backgroundColor: '#fff',
  },
  calendarBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  calendarBadgeTextSelected: {
    color: '#ef4444',
  },
  selectedDayAppointments: {
    marginTop: 8,
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyCalendarState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyCalendarText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    fontWeight: '500',
  },
  calendarAppointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  calendarAppointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  calendarAppointmentInfo: {
    flex: 1,
  },
  calendarAppointmentService: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  calendarAppointmentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarAppointmentTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  calendarStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  calendarStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarAppointmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  calendarModifyButton: {
    backgroundColor: '#2563eb',
  },
  calendarCancelButton: {
    backgroundColor: '#ef4444',
  },
  calendarCompleteButton: {
    backgroundColor: '#6366f1',
  },
  calendarActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  // Subscription Card Styles
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  subscriptionContent: {
    marginBottom: 16,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  subscriptionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  subscriptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  subscriptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Business Menu Styles
  businessMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  businessMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  businessMenuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessMenuContent: {
    flex: 1,
  },
  businessMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  businessMenuSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  // Subscription Required Card
  subscriptionRequiredCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  subscriptionRequiredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  subscriptionRequiredText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  subscriptionRequiredButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  subscriptionRequiredButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
