import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Backend API URL - Environment variable'dan al veya default kullan
const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function BookingScreen() {
  const { shopId, appointmentId, modifyMode } = useLocalSearchParams<{ shopId: string; appointmentId?: string; modifyMode?: string }>();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [shopData, setShopData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModifyMode, setIsModifyMode] = useState(false);
  const [existingAppointment, setExistingAppointment] = useState<any>(null);
  
  // Tekrarlayan randevular
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'weekly' | 'monthly' | null>(null);
  const [recurringCount, setRecurringCount] = useState<number>(4);

  useEffect(() => {
    if (modifyMode === 'true' && appointmentId) {
      setIsModifyMode(true);
      loadExistingAppointment();
    }
  }, [appointmentId, modifyMode]);

  useEffect(() => {
    // Shop data'yı yükle (modify mode'da existingAppointment yüklendikten sonra)
    if (isModifyMode && existingAppointment) {
      loadShopData();
    } else if (!isModifyMode) {
      loadShopData();
    }
    loadCustomerInfo();
  }, [shopId, isModifyMode, existingAppointment]);

  const loadExistingAppointment = async () => {
    if (!appointmentId) return;
    try {
      const appointmentDoc = await getDoc(doc(db, 'bookings', appointmentId));
      if (appointmentDoc.exists()) {
        const data = appointmentDoc.data();
        const appointment: any = { id: appointmentDoc.id, ...data };
        setExistingAppointment(appointment);
        setSelectedDate(data.preferredDate || '');
        setSelectedTime(data.preferredTime || '');
        setSelectedService(data.service || '');
        setSelectedStaff(data.staff || '');
        setCustomerName(data.name || '');
        setCustomerPhone(data.phone || '');
        setCustomerEmail(data.customerEmail || '');
        
        // ShopId yoksa shopName ile ara
        if (!appointment.shopId && !appointment.shopSlug && appointment.shopName) {
          try {
            const shopsQuery = query(collection(db, 'shops'), where('name', '==', appointment.shopName));
            const snapshot = await getDocs(shopsQuery);
            if (!snapshot.empty) {
              const shopDoc = snapshot.docs[0];
              const shopData = shopDoc.data();
              appointment.shopId = shopData?.slug || shopDoc.id;
              appointment.shopSlug = shopData?.slug || shopDoc.id;
              setExistingAppointment({ ...appointment });
            }
          } catch (error) {
            console.error('Error finding shop by name:', error);
          }
        }
      } else {
        Alert.alert('Hata', 'Randevu bulunamadı.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading existing appointment:', error);
      Alert.alert('Hata', 'Randevu bilgileri yüklenirken bir hata oluştu');
    }
  };

  const loadCustomerInfo = async () => {
    if (user) {
      setCustomerName(user.displayName || user.email?.split('@')[0] || '');
      setCustomerEmail(user.email || '');
    } else {
      // Guest mode - AsyncStorage'dan yükle
      const guestInfo = await AsyncStorage.getItem('guestInfo');
      if (guestInfo) {
        const parsed = JSON.parse(guestInfo);
        setCustomerName(parsed.name || '');
        setCustomerPhone(parsed.phone || '');
        setCustomerEmail(parsed.email || '');
      }
    }
  };

  /**
   * İşletme sahibinin telefon numarasını Firestore'dan çeker
   */
  const getBusinessOwnerPhone = async (ownerId: string): Promise<string | null> => {
    try {
      if (!ownerId || !shopData) return null;
      
      // users koleksiyonundan okuma yapmıyoruz (permission hatası alıyoruz)
      // Telefon numarasını shopData'dan alıyoruz
      // Not: İşletme sahipleri shop bilgilerini kaydederken telefon numarasını da kaydetmeli
      return shopData.ownerPhone || shopData.phone || shopData.ownerPhoneNumber || null;
    } catch (error) {
      console.error('[Booking] İşletme sahibi telefon numarası alınamadı:', error);
      return null;
    }
  };

  /**
   * Randevu oluşturulduğunda SMS gönderir
   */
  const sendAppointmentSMS = async (bookingData: any, shopData: any) => {
    try {
      // İşletme sahibinin telefon numarasını al
      const businessOwnerPhone = await getBusinessOwnerPhone(bookingData.ownerId);
      
      if (!businessOwnerPhone && !bookingData.phone) {
        console.log('[SMS] Telefon numarası bulunamadı, SMS gönderilmiyor');
        return;
      }

      const appointmentData = {
        shopName: shopData.name || bookingData.shopName,
        service: bookingData.service,
        preferredDate: bookingData.preferredDate,
        preferredTime: bookingData.preferredTime,
        customerName: bookingData.name,
        customerPhone: bookingData.phone,
      };

      const response = await axios.post(
        `${BACKEND_API_URL}/api/sms/appointment`,
        {
          appointmentData,
          businessOwnerPhone,
        },
        {
          timeout: 10000,
        }
      );

      if (response.data.status === 'success') {
        console.log('[SMS] ✅ SMS başarıyla gönderildi');
      } else {
        console.warn('[SMS] ⚠️ SMS gönderimi kısmen başarılı:', response.data);
      }
    } catch (error: any) {
      // SMS hatası kritik değil, sadece log'la
      console.error('[SMS] ❌ SMS gönderme hatası:', error.message);
      if (error.response) {
        console.error('[SMS] Response:', error.response.data);
      }
      // Hata olsa bile throw etme, randevu kaydı başarılı olmalı
    }
  };

  const loadShopData = async () => {
    // Randevu değiştirme modunda, mevcut randevudan shopId al
    let currentShopId = shopId;
    
    if (isModifyMode && existingAppointment) {
      currentShopId = existingAppointment.shopId || existingAppointment.shopSlug || currentShopId;
    }
    
    if (!currentShopId) {
      // Eğer hala shopId yoksa, bekleyelim (existingAppointment henüz yüklenmemiş olabilir)
      if (isModifyMode && !existingAppointment) {
        console.log('[Booking] Waiting for existingAppointment to load...');
        return;
      }
      Alert.alert('Hata', 'Dükkan bilgisi bulunamadı.');
      router.back();
      return;
    }

    try {
      setLoading(true);
      // Önce Firestore'dan yükle (slug veya id ile)
      // shopId'yi normalize et (lowercase, trim)
      const normalizedShopId = decodeURIComponent(String(currentShopId)).toLowerCase().trim();
      
      let shopDoc = await getDoc(doc(db, 'shops', normalizedShopId));
      
      if (shopDoc.exists()) {
        const data = shopDoc.data();
        if (data) {
          setShopData({
            id: shopDoc.id,
            slug: data.slug || shopDoc.id,
            name: data.name || '',
            address: data.address || '',
            services: data.services || [],
            ownerId: data.ownerId || '',
            staff: data.staff || [],
            instagramUrl: data.instagramUrl || '',
          });
          setServices(data.services || []);
          setLoading(false);
          return;
        }
      }

      // Firestore'da bulunamadıysa, slug ile dene
      const shopsQuery = query(collection(db, 'shops'), where('slug', '==', normalizedShopId));
      const snapshot = await getDocs(shopsQuery);
      
      if (!snapshot.empty) {
        shopDoc = snapshot.docs[0];
        const data = shopDoc.data();
        if (data) {
          setShopData({
            id: shopDoc.id,
            slug: data.slug || shopDoc.id,
            name: data.name || '',
            address: data.address || '',
            services: data.services || [],
            ownerId: data.ownerId || '',
            staff: data.staff || [],
            instagramUrl: data.instagramUrl || '',
          });
          setServices(data.services || []);
          setLoading(false);
          return;
        }
      }

      // Firestore'da yoksa, AsyncStorage'dan yükle (Google Places API shops için)
      const allShopsData = await AsyncStorage.getItem('allShops');
      if (allShopsData) {
        const allShops = JSON.parse(allShopsData);
        const shop = allShops.find((s: any) => {
          const sId = (s.placeId || s.slug || s.id || s.name || '').toLowerCase().trim();
          return sId === normalizedShopId;
        });
        
        if (shop) {
          setShopData(shop);
          setServices(shop.services || []);
          setLoading(false);
          return;
        }
      }

      Alert.alert('Hata', 'Dükkan bilgileri yüklenemedi.');
      router.back();
    } catch (error) {
      console.error('Error loading shop data:', error);
      Alert.alert('Hata', 'Dükkan bilgileri yüklenirken bir hata oluştu.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const generateDates = () => {
    // Bugünden itibaren 7 günlük tarih listesi oluştur
    const dates = [];
    const today = new Date();
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: dayNames[date.getDay()],
        display: `${date.getDate()} ${monthNames[date.getMonth()]}`,
      });
    }
    return dates;
  };

  const generateRecurringDates = (startDate: string, type: 'weekly' | 'monthly', count: number): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < count; i++) {
      const date = new Date(start);
      if (type === 'weekly') {
        date.setDate(start.getDate() + (i * 7));
      } else if (type === 'monthly') {
        date.setMonth(start.getMonth() + i);
      }
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const dates = generateDates();

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30'
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      Alert.alert('Eksik Bilgi', 'Lütfen tarih, saat ve hizmet seçiniz.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ad soyad ve telefon numaranızı giriniz.');
      return;
    }
    
    if (!shopData) {
      Alert.alert('Hata', 'Dükkan bilgileri yüklenemedi.');
      return;
    }

    // Tekrarlayan randevu kontrolü
    if (isRecurring && !recurringType) {
      Alert.alert('Eksik Bilgi', 'Lütfen tekrarlama tipini seçiniz (Haftalık/Aylık).');
      return;
    }

    try {
      // Randevu değiştirme modu
      if (isModifyMode && existingAppointment) {
        // Sadece tarih, saat ve hizmet güncellenebilir (shop bilgileri değişmez)
        // Status'u bookingData'ya EKLEME - Firestore'da alanı güncellemezseniz mevcut değeri korunur
        // Rules'da status değişmemeli kontrolü var, bu yüzden status'u affectedKeys() içinde görmek istemiyoruz
        const bookingData = {
          service: selectedService.name || selectedService,
          preferredDate: selectedDate,
          preferredTime: selectedTime,
          staff: selectedStaff || null,
          updatedAt: serverTimestamp(),
        };

        console.log('========================================');
        console.log('[Booking] 🔄 Updating appointment');
        console.log('========================================');
        console.log('Appointment ID:', existingAppointment.id);
        console.log('Appointment customerId:', existingAppointment.customerId);
        console.log('Appointment customerEmail:', existingAppointment.customerEmail);
        console.log('Current user UID:', user?.uid);
        console.log('Current user email:', user?.email);
        console.log('Is authenticated:', !!user);
        console.log('Booking data to update:', JSON.stringify(bookingData, null, 2));
        console.log('========================================');

        await updateDoc(doc(db, 'bookings', existingAppointment.id), bookingData);
        Alert.alert('Başarılı', 'Randevu başarıyla güncellendi.');
        router.back();
        return;
      }

      // Tekrarlayan randevu oluşturma
      if (isRecurring && recurringType) {
        const dates = generateRecurringDates(selectedDate, recurringType, recurringCount);
        const bookingsRef = collection(db, 'bookings');
        const groupId = doc(bookingsRef).id; // Grup ID'si (tüm tekrarlayan randevular için aynı)
        
        for (const date of dates) {
          const bookingData = {
            shopId: shopData.id || shopData.slug || shopId,
            shopSlug: shopData.slug || shopData.id || shopId,
            shopName: shopData.name || '',
            ownerId: shopData.ownerId || '',
            customerId: user?.uid || null,
            customerEmail: customerEmail || user?.email || '',
            name: customerName.trim(),
            phone: customerPhone.trim(),
            service: selectedService.name || selectedService,
            duration: selectedService.duration || 60,
            price: selectedService.price || 0,
            preferredDate: date,
            preferredTime: selectedTime,
            staff: selectedStaff || null,
            status: 'confirmed',
            source: 'mobile',
            notes: '',
            isRecurring: true,
            recurringType: recurringType,
            recurringGroupId: groupId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          await setDoc(doc(bookingsRef), bookingData);
        }
        
        // SMS gönder (sadece ilk randevu için)
        try {
          const firstBookingData = {
            shopName: shopData.name || '',
            service: selectedService.name || selectedService,
            preferredDate: dates[0],
            preferredTime: selectedTime,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
          };
          await sendAppointmentSMS(firstBookingData, shopData);
        } catch (smsError: any) {
          console.error('[Booking] SMS gönderme hatası:', smsError.message);
        }
        
        Alert.alert('Başarılı', `${dates.length} adet tekrarlayan randevu oluşturuldu ve otomatik olarak onaylandı.`);
        router.back();
        return;
      }

      // Normal randevu oluşturma
      const bookingData = {
        shopId: shopData.id || shopData.slug || shopId,
        shopSlug: shopData.slug || shopData.id || shopId,
        shopName: shopData.name || '',
        ownerId: shopData.ownerId || '',
        customerId: user?.uid || null, // Guest mode için null
        customerEmail: customerEmail || user?.email || '',
        name: customerName.trim(),
        phone: customerPhone.trim(),
        service: selectedService.name || selectedService,
        duration: selectedService.duration || 60,
        price: selectedService.price || 0,
        preferredDate: selectedDate, // YYYY-MM-DD formatında
        preferredTime: selectedTime, // HH:mm formatında
        staff: selectedStaff || null,
        status: 'confirmed', // Otomatik onaylanıyor
        source: 'mobile',
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      console.log('[Booking] Saving to Firestore:', {
        customerId: bookingData.customerId,
        customerEmail: bookingData.customerEmail,
        userUid: user?.uid,
        shopName: bookingData.shopName,
      });

      // Firestore'a kaydet
      console.log('[Booking] Attempting to save to Firestore...');
      console.log('[Booking] db object:', db ? 'exists' : 'null');
      console.log('[Booking] bookingData:', JSON.stringify(bookingData, null, 2));
      
      const bookingsRef = collection(db, 'bookings');
      const newBookingRef = doc(bookingsRef);
      
      try {
        await setDoc(newBookingRef, bookingData);
        const savedId = newBookingRef.id;
        console.log('[Booking] ✅ Successfully saved to Firestore with ID:', savedId);
        
        // Kullanıcıya bilgi ver (debug için)
        console.log('[Booking] Firestore kayıt başarılı! ID:', savedId);
        console.log('[Booking] customerId:', bookingData.customerId);
        console.log('[Booking] customerEmail:', bookingData.customerEmail);
      } catch (firestoreError: any) {
        console.error('[Booking] ❌ Firestore save error:', firestoreError);
        console.error('[Booking] Error code:', firestoreError?.code);
        console.error('[Booking] Error message:', firestoreError?.message);
        
        // Hata mesajını Alert ile göster
        Alert.alert(
          'Firestore Hatası',
          `Randevu Firestore'a kaydedilemedi.\n\nHata: ${firestoreError?.message || 'Bilinmeyen hata'}\n\nKod: ${firestoreError?.code || 'N/A'}`,
          [{ text: 'Tamam' }]
        );
        
        throw firestoreError; // Re-throw to be caught by outer catch
      }

      // AsyncStorage'a da kaydet (offline fallback için)
      const appointment = {
        id: newBookingRef.id,
        shopName: shopData.name,
        shopAddress: shopData.address || '',
        service: selectedService.name || selectedService,
        date: selectedDate,
        time: selectedTime,
        status: 'Onaylandı',
        createdAt: new Date().toISOString(),
      };

      const appointments = await AsyncStorage.getItem('appointments');
      let appointmentsList = appointments ? JSON.parse(appointments) : [];
      appointmentsList.push(appointment);
      await AsyncStorage.setItem('appointments', JSON.stringify(appointmentsList));

      // SMS gönder (async, hata olsa bile devam et)
      try {
        await sendAppointmentSMS(bookingData, shopData);
      } catch (smsError: any) {
        console.error('[Booking] SMS gönderme hatası (devam ediliyor):', smsError.message);
        // SMS hatası randevu kaydını engellemez
      }

      const selectedDateObj = dates.find(d => d.date === selectedDate);
      Alert.alert(
        'Randevu Onaylandı',
        `Randevunuz başarıyla oluşturuldu ve otomatik olarak onaylandı!\n\nDükkan: ${shopData.name}\nTarih: ${selectedDateObj?.display || selectedDate}\nSaat: ${selectedTime}\nHizmet: ${selectedService.name || selectedService}`,
        [
          { 
            text: 'Tamam', 
            onPress: () => {
              router.replace('/(tabs)/profile');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('[Booking] ❌ Error saving appointment:', error);
      console.error('[Booking] Error details:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
      });
      
      let errorMessage = 'Randevu kaydedilirken bir hata oluştu.';
      if (error?.code === 'permission-denied') {
        errorMessage = 'Firestore izin hatası. Lütfen Firebase Console\'da güvenlik kurallarını kontrol edin.';
      } else if (error?.code === 'unavailable') {
        errorMessage = 'Firestore bağlantı hatası. İnternet bağlantınızı kontrol edin.';
      } else if (error?.message) {
        errorMessage = `Hata: ${error.message}`;
      }
      
      Alert.alert('Hata', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: '#64748b' }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isModifyMode ? 'Randevu Değiştir' : 'Randevu Al'}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Shop Info */}
      {shopData && (
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shopData.name || 'Dükkan'}</Text>
          {shopData.address && (
            <Text style={styles.shopAddress}>{shopData.address}</Text>
          )}
        </View>
      )}

      {/* 4 Adımlı Süreç Göstergesi */}
      <View style={styles.stepsContainer}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, selectedService && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, selectedService && styles.stepNumberActive]}>1</Text>
          </View>
          <Text style={[styles.stepLabel, selectedService && styles.stepLabelActive]}>Hizmet</Text>
        </View>
        <View style={styles.stepConnector} />
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, shopData?.staff && shopData.staff.length > 0 && selectedStaff !== undefined && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, shopData?.staff && shopData.staff.length > 0 && selectedStaff !== undefined && styles.stepNumberActive]}>2</Text>
          </View>
          <Text style={[styles.stepLabel, shopData?.staff && shopData.staff.length > 0 && selectedStaff !== undefined && styles.stepLabelActive]}>Personel</Text>
        </View>
        <View style={styles.stepConnector} />
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, selectedDate && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, selectedDate && styles.stepNumberActive]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, selectedDate && styles.stepLabelActive]}>Tarih</Text>
        </View>
        <View style={styles.stepConnector} />
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, selectedTime && styles.stepCircleActive]}>
            <Text style={[styles.stepNumber, selectedTime && styles.stepNumberActive]}>4</Text>
          </View>
          <Text style={[styles.stepLabel, selectedTime && styles.stepLabelActive]}>Saat</Text>
        </View>
      </View>

      {/* Service Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hizmet Seçin</Text>
        {services.length > 0 ? (
          services.map((service, index) => (
            <TouchableOpacity
              key={service.id || index}
              style={[
                styles.serviceItem,
                selectedService?.name === service.name && styles.selectedService
              ]}
              onPress={() => setSelectedService(service)}
            >
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name || 'Hizmet'}</Text>
                {service.duration && (
                  <Text style={styles.serviceDuration}>{service.duration} dakika</Text>
                )}
              </View>
              <Text style={styles.servicePrice}>{service.price ? `₺${service.price}` : 'Fiyat yok'}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>Henüz hizmet eklenmemiş</Text>
        )}
      </View>

      {/* Staff Selection */}
      {shopData?.staff && shopData.staff.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personel Seçin</Text>
          <View style={styles.staffContainer}>
            <TouchableOpacity
              style={[
                styles.staffOption,
                selectedStaff === '' && styles.staffOptionSelected
              ]}
              onPress={() => setSelectedStaff('')}
            >
              <Text style={[styles.staffOptionText, selectedStaff === '' && styles.staffOptionTextSelected]}>
                Fark Etmez
              </Text>
            </TouchableOpacity>
            {shopData.staff.map((staffName: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.staffOption,
                  selectedStaff === staffName && styles.staffOptionSelected
                ]}
                onPress={() => setSelectedStaff(staffName)}
              >
                <Text style={[styles.staffOptionText, selectedStaff === staffName && styles.staffOptionTextSelected]}>
                  {staffName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tarih Seçin</Text>
        {/* Bugün/Yarın Butonları */}
        <View style={styles.dateButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.dateQuickButton,
              selectedDate === new Date().toISOString().split('T')[0] && styles.dateQuickButtonActive
            ]}
            onPress={() => {
              const today = new Date().toISOString().split('T')[0];
              setSelectedDate(today);
            }}
          >
            <Text style={[
              styles.dateQuickButtonText,
              selectedDate === new Date().toISOString().split('T')[0] && styles.dateQuickButtonTextActive
            ]}>
              Bugün
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.dateQuickButton,
              (() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return selectedDate === tomorrow.toISOString().split('T')[0];
              })() && styles.dateQuickButtonActive
            ]}
            onPress={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(tomorrow.toISOString().split('T')[0]);
            }}
          >
            <Text style={[
              styles.dateQuickButtonText,
              (() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return selectedDate === tomorrow.toISOString().split('T')[0];
              })() && styles.dateQuickButtonTextActive
            ]}>
              Yarın
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
          {dates.map((date) => (
            <TouchableOpacity
              key={date.date}
              style={[
                styles.dateItem,
                selectedDate === date.date && styles.selectedDate
              ]}
              onPress={() => setSelectedDate(date.date)}
            >
              <Text style={styles.dateDay}>{date.day}</Text>
              <Text style={styles.dateDisplay}>{date.display}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saat Seçin</Text>
        <View style={styles.timesGrid}>
          {availableTimes.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeItem,
                selectedTime === time && styles.selectedTime
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recurring Appointments (only for new appointments) */}
      {!isModifyMode && (
        <View style={styles.section}>
          <View style={styles.recurringHeader}>
            <Text style={styles.sectionTitle}>Tekrarlayan Randevu</Text>
            <TouchableOpacity
              style={styles.toggleSwitch}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <View style={[styles.toggleSwitchTrack, isRecurring && styles.toggleSwitchTrackActive]}>
                <View style={[styles.toggleSwitchThumb, isRecurring && styles.toggleSwitchThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>
          
          {isRecurring && (
            <View style={styles.recurringOptions}>
              <Text style={styles.recurringLabel}>Tekrarlama Tipi</Text>
              <View style={styles.recurringTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.recurringTypeButton,
                    recurringType === 'weekly' && styles.recurringTypeButtonActive
                  ]}
                  onPress={() => setRecurringType('weekly')}
                >
                  <IconSymbol name="calendar" size={18} color={recurringType === 'weekly' ? '#fff' : '#64748b'} />
                  <Text style={[
                    styles.recurringTypeButtonText,
                    recurringType === 'weekly' && styles.recurringTypeButtonTextActive
                  ]}>
                    Haftalık
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.recurringTypeButton,
                    recurringType === 'monthly' && styles.recurringTypeButtonActive
                  ]}
                  onPress={() => setRecurringType('monthly')}
                >
                  <IconSymbol name="calendar" size={18} color={recurringType === 'monthly' ? '#fff' : '#64748b'} />
                  <Text style={[
                    styles.recurringTypeButtonText,
                    recurringType === 'monthly' && styles.recurringTypeButtonTextActive
                  ]}>
                    Aylık
                  </Text>
                </TouchableOpacity>
              </View>
              
              {recurringType && (
                <View style={styles.recurringCountContainer}>
                  <Text style={styles.recurringLabel}>Kaç kez tekrarlansın?</Text>
                  <View style={styles.recurringCountButtons}>
                    {[2, 4, 6, 8, 12].map((count) => (
                      <TouchableOpacity
                        key={count}
                        style={[
                          styles.recurringCountButton,
                          recurringCount === count && styles.recurringCountButtonActive
                        ]}
                        onPress={() => setRecurringCount(count)}
                      >
                        <Text style={[
                          styles.recurringCountButtonText,
                          recurringCount === count && styles.recurringCountButtonTextActive
                        ]}>
                          {count}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.recurringInfo}>
                    {recurringType === 'weekly' 
                      ? `${recurringCount} hafta boyunca her hafta aynı gün ve saatte randevu oluşturulacak.`
                      : `${recurringCount} ay boyunca her ay aynı gün ve saatte randevu oluşturulacak.`}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad *"
          value={customerName}
          onChangeText={setCustomerName}
          editable={!isModifyMode}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefon *"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
          editable={!isModifyMode}
        />
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isModifyMode}
        />
      </View>

      {/* Book Button */}
      <View style={styles.bookContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>
            {isModifyMode ? 'Randevuyu Güncelle' : isRecurring ? `${recurringCount} Randevu Oluştur` : 'Randevuyu Onayla'}
          </Text>
        </TouchableOpacity>
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  shopInfo: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  shopAddress: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  selectedService: {
    borderColor: '#dc2626',
    backgroundColor: '#F0F8FF',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  datesScroll: {
    marginBottom: 10,
  },
  dateItem: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedDate: {
    borderColor: '#dc2626',
    backgroundColor: '#F0F8FF',
  },
  dateDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateDisplay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeItem: {
    width: '18%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedTime: {
    borderColor: '#dc2626',
    backgroundColor: '#F0F8FF',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  bookContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleSwitch: {
    padding: 4,
  },
  toggleSwitchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchTrackActive: {
    backgroundColor: '#2563eb',
  },
  toggleSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleSwitchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  recurringOptions: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recurringLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  recurringTypeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  recurringTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    gap: 8,
  },
  recurringTypeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  recurringTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  recurringTypeButtonTextActive: {
    color: '#fff',
  },
  recurringCountContainer: {
    marginTop: 8,
  },
  recurringCountButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  recurringCountButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  recurringCountButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  recurringCountButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  recurringCountButtonTextActive: {
    color: '#fff',
  },
  recurringInfo: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginTop: 8,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#dc2626',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#dc2626',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
    marginBottom: 20,
  },
  staffContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  staffOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  staffOptionSelected: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  staffOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  staffOptionTextSelected: {
    color: '#fff',
  },
  dateButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  dateQuickButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  dateQuickButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  dateQuickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  dateQuickButtonTextActive: {
    color: '#fff',
  },
});
