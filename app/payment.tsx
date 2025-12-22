import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const name = params.name as string;
  const userType = params.userType as string;
  const isExtend = params.extend === 'true';
  const durationMonths = params.duration ? parseInt(params.duration as string, 10) : 1;
  const { user } = useAuth();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [contactName, setContactName] = useState(name || '');
  const [contactPhone, setContactPhone] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSubscriptionEnd, setCurrentSubscriptionEnd] = useState<Date | null>(null);

  // Aylık abonelik ücreti
  const MONTHLY_FEE = 800;
  
  // Süre bazlı fiyatlandırma (indirimli)
  const getPriceForDuration = (months: number): number => {
    const basePrice = MONTHLY_FEE * months;
    if (months >= 12) return basePrice * 0.8; // 20% indirim
    if (months >= 6) return basePrice * 0.85; // 15% indirim
    if (months >= 3) return basePrice * 0.9; // 10% indirim
    return basePrice;
  };

  const selectedPrice = isExtend ? getPriceForDuration(durationMonths) : MONTHLY_FEE;

  const formatCardNumber = (text: string) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D/g, '');
    // 4'erli gruplara ayır
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19); // Max 16 rakam + 3 boşluk
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(formatExpiryDate(text));
  };

  useEffect(() => {
    const loadPendingInfo = async () => {
      try {
        if (!contactName) {
          const pending = await AsyncStorage.getItem('pendingBusinessOwner');
          if (pending) {
            const parsed = JSON.parse(pending);
            if (parsed?.name) {
              setContactName(parsed.name);
            }
          }
        }

        if (!contactPhone && user?.phoneNumber) {
          setContactPhone(user.phoneNumber);
        }

        // Eğer extend modundaysa, mevcut abonelik bitiş tarihini yükle
        if (isExtend && user?.uid) {
          const { doc, getDoc } = await import('firebase/firestore');
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.subscriptionEndsAt) {
              const endDate = userData.subscriptionEndsAt?.toDate 
                ? userData.subscriptionEndsAt.toDate() 
                : new Date(userData.subscriptionEndsAt);
              setCurrentSubscriptionEnd(endDate);
            }
          }
        }
      } catch (error) {
        console.warn('[Payment] Pending info yüklenemedi:', error);
      }
    };

    loadPendingInfo();
  }, [contactName, contactPhone, user?.phoneNumber, isExtend, user?.uid]);

  const handlePayment = async () => {
    if (!cardNumber.trim() || !cardHolder.trim() || !expiryDate.trim() || !cvv.trim()) {
      Alert.alert('Hata', 'Lütfen tüm kart bilgilerini doldurunuz.');
      return;
    }

    // Basit validasyon
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length !== 16) {
      Alert.alert('Hata', 'Kart numarası 16 haneli olmalıdır.');
      return;
    }

    if (expiryDate.length !== 5) {
      Alert.alert('Hata', 'Son kullanma tarihi geçerli değil.');
      return;
    }

    if (cvv.length !== 3) {
      Alert.alert('Hata', 'CVV 3 haneli olmalıdır.');
      return;
    }

    if (!contactName.trim()) {
      Alert.alert('Hata', 'Lütfen ad soyad giriniz.');
      return;
    }

    const cleanedPhone = contactPhone.replace(/[^\d]/g, '');
    if (cleanedPhone.length < 10) {
      Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz (05xx ...).');
      return;
    }

    const [expMonth, expYearRaw] = expiryDate.split('/');
    const expireMonth = expMonth;
    const expireYear = expYearRaw?.length === 2 ? `20${expYearRaw}` : expYearRaw;

    const nameParts = contactName.trim().split(' ');
    const surname = nameParts.length > 1 ? (nameParts.pop() || 'Sahibi') : 'Sahibi';
    const firstName = nameParts.join(' ') || contactName.trim() || 'İşletme';

    setLoading(true);
    
    try {
      const response = await axios.post(`${BACKEND_API_URL}/api/payments/subscribe`, {
        customer: {
          name: firstName,
          surname,
          email: email || user?.email,
          phone: cleanedPhone,
          identityNumber: identityNumber || '11111111111',
        },
        card: {
          cardHolderName: cardHolder,
          cardNumber: cleanedCardNumber,
          expireMonth,
          expireYear,
          cvc: cvv, // cvv state'ini cvc olarak gönder
        },
        address: {
          city: 'İstanbul',
          country: 'Turkey',
          line: 'Randevum İşletme Adresi',
          zipCode: '34000',
        },
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data?.message || 'Ödeme işlemi tamamlanamadı.');
      }

      const subscriptionData = response.data.data;
      
      // Eğer extend modundaysa, mevcut bitiş tarihine ekle, değilse yeni tarih hesapla
      let subscriptionEndDate: string;
      if (isExtend && currentSubscriptionEnd) {
        // Mevcut bitiş tarihine seçilen süreyi ekle
        const newEndDate = new Date(currentSubscriptionEnd);
        newEndDate.setMonth(newEndDate.getMonth() + durationMonths);
        subscriptionEndDate = newEndDate.toISOString();
      } else {
        // Yeni abonelik: şu anki tarihten itibaren seçilen süre kadar
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + (isExtend ? durationMonths : 1));
        subscriptionEndDate = newEndDate.toISOString();
      }

      if (user?.uid) {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            role: 'admin',
            subscriptionStatus: 'active',
            subscriptionPlan: 'business-monthly',
            subscriptionProvider: 'iyzico',
            subscriptionEndsAt: subscriptionEndDate,
            subscriptionStartedAt: serverTimestamp(),
            iyzico: {
              customerReferenceCode: subscriptionData.customerReferenceCode,
              subscriptionReferenceCode: subscriptionData.subscriptionReferenceCode,
              pricingPlanReferenceCode: subscriptionData.pricingPlanReferenceCode,
            },
          },
          { merge: true }
        );
      }

      const businessInfo = {
        email,
        name: contactName,
        userType: 'business',
        paymentStatus: 'active',
        subscriptionStartDate: new Date().toISOString(),
        subscriptionEndDate,
      };

      await AsyncStorage.setItem('businessOwner', JSON.stringify(businessInfo));
      await AsyncStorage.setItem('userType', 'business');
      await AsyncStorage.removeItem('pendingBusinessOwner');

      Alert.alert(
        'Ödeme Başarılı!',
        'İşletme sahibi hesabınız aktif edildi. Artık mekanınızı ekleyebilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => router.replace('/(tabs)/profile')
          }
        ]
      );
    } catch (error: any) {
      console.error('Payment error:', error?.response?.data || error?.message || error);
      const message = error?.response?.data?.message || error?.message || 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
      Alert.alert('Ödeme Hatası', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ödeme</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <IconSymbol name="building.2.fill" size={48} color="#dc2626" />
              <Text style={styles.pricingTitle}>
                {isExtend ? 'Abonelik Uzatma' : 'İşletme Sahibi Üyeliği'}
              </Text>
              <Text style={styles.pricingSubtitle}>
                {isExtend 
                  ? `${durationMonths} ${durationMonths === 1 ? 'Ay' : 'Ay'} Abonelik`
                  : 'Aylık Abonelik'}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceAmount}>{selectedPrice.toFixed(2)}</Text>
              <Text style={styles.priceCurrency}>₺</Text>
            </View>
            {isExtend && durationMonths > 1 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {durationMonths >= 12 ? '20%' : durationMonths >= 6 ? '15%' : '10%'} İndirim
                </Text>
              </View>
            )}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
                <Text style={styles.featureText}>Sınırsız randevu yönetimi</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
                <Text style={styles.featureText}>Müşteri yönetimi</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
                <Text style={styles.featureText}>İstatistikler ve raporlar</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
                <Text style={styles.featureText}>Haritada görünürlük</Text>
              </View>
            </View>
          </View>

          <View style={styles.paymentForm}>
            <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
            <View style={styles.inputContainer}>
              <IconSymbol name="person.crop.circle" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor="#94a3b8"
                value={contactName}
                onChangeText={setContactName}
              />
            </View>
            <View style={styles.inputContainer}>
              <IconSymbol name="phone.fill" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Telefon (05xx xxx xx xx)"
                placeholderTextColor="#94a3b8"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                maxLength={14}
              />
            </View>
            <View style={styles.inputContainer}>
              <IconSymbol name="person.text.rectangle" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="T.C. Kimlik No (opsiyonel)"
                placeholderTextColor="#94a3b8"
                value={identityNumber}
                onChangeText={setIdentityNumber}
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            <Text style={styles.sectionTitle}>Kart Bilgileri</Text>

            <View style={styles.inputContainer}>
              <IconSymbol name="creditcard" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Kart Numarası"
                placeholderTextColor="#94a3b8"
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="person" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Kart Üzerindeki İsim"
                placeholderTextColor="#94a3b8"
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <IconSymbol name="calendar" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="AA/YY"
                  placeholderTextColor="#94a3b8"
                  value={expiryDate}
                  onChangeText={handleExpiryDateChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <IconSymbol name="lock" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="CVV"
                  placeholderTextColor="#94a3b8"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={3}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={loading}
            >
              <Text style={styles.payButtonText}>
                {loading ? 'İşleniyor...' : `${MONTHLY_FEE.toFixed(2)} ₺ Öde`}
              </Text>
            </TouchableOpacity>

            <View style={styles.securityInfo}>
              <IconSymbol name="lock.shield.fill" size={16} color="#10b981" />
              <Text style={styles.securityText}>
                Ödeme bilgileriniz güvenli bir şekilde işlenmektedir.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#dc2626',
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
  content: {
    flex: 1,
    padding: 24,
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pricingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  pricingSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#dc2626',
  },
  priceCurrency: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    marginLeft: 4,
  },
  discountBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: -10,
    marginBottom: 10,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  paymentForm: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  payButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  securityText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
  },
});

