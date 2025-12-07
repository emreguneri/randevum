import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ServiceItem = { id: string; name: string; duration: number; price: number };

const WEEK_DAYS = [
  { label: 'Pazar', value: 0 },
  { label: 'Pazartesi', value: 1 },
  { label: 'Salı', value: 2 },
  { label: 'Çarşamba', value: 3 },
  { label: 'Perşembe', value: 4 },
  { label: 'Cuma', value: 5 },
  { label: 'Cumartesi', value: 6 },
];

export default function ShopInfo() {
  const { user } = useAuth();
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [openingHour, setOpeningHour] = useState('09:00');
  const [closingHour, setClosingHour] = useState('20:00');
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5, 6]); // Pazartesi-Cumartesi varsayılan
  const [timezone, setTimezone] = useState('Europe/Istanbul');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [staff, setStaff] = useState<string[]>([]);
  const [staffName, setStaffName] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const hasAccess = await checkPaymentStatus();
      if (hasAccess) {
        await loadShopData();
      }
    };
    init();
  }, [user]);

  const checkPaymentStatus = async () => {
    try {
      if (!user?.uid) {
        Alert.alert('Hata', 'Giriş yapmanız gerekmektedir.', [{ text: 'Tamam', onPress: () => router.back() }]);
        return false;
      }

      // Önce AsyncStorage'dan kontrol et (eski sistem uyumluluğu için)
      const businessOwner = await AsyncStorage.getItem('businessOwner');
      if (businessOwner) {
        const parsed = JSON.parse(businessOwner);
        if (parsed.paymentStatus === 'active') {
          // Firestore'da da güncelle (senkronizasyon için)
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              await updateDoc(userDocRef, {
                role: 'admin',
                subscriptionStatus: 'active',
                subscriptionEndsAt: parsed.subscriptionEndDate ? new Date(parsed.subscriptionEndDate) : null,
              });
            } else {
              // Kullanıcı Firestore'da yoksa oluştur
              await setDoc(userDocRef, {
                email: user.email || '',
                displayName: user.displayName || '',
                role: 'admin',
                subscriptionStatus: 'active',
                subscriptionEndsAt: parsed.subscriptionEndDate ? new Date(parsed.subscriptionEndDate) : null,
                createdAt: serverTimestamp(),
              });
            }
          } catch (firestoreError) {
            console.error('Error syncing to Firestore:', firestoreError);
            // Firestore hatası olsa bile AsyncStorage'dan kontrol ettiğimiz için devam et
          }
          return true;
        }
      }

      // Firestore'dan kullanıcı profilini kontrol et
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'admin' && userData.subscriptionStatus === 'active') {
          return true;
        }
      }

      // Her iki yerde de aktif abonelik yoksa hata ver
      Alert.alert(
        'Ödeme Gerekli',
        'Mekan eklemek veya düzenlemek için aktif bir aboneliğiniz olmalıdır.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      // Hata durumunda AsyncStorage'dan kontrol et (fallback)
      try {
        const businessOwner = await AsyncStorage.getItem('businessOwner');
        if (businessOwner) {
          const parsed = JSON.parse(businessOwner);
          if (parsed.paymentStatus === 'active') {
            return true;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback check error:', fallbackError);
      }
      Alert.alert('Hata', 'Ödeme durumu kontrol edilemedi.', [{ text: 'Tamam', onPress: () => router.back() }]);
      return false;
    }
  };

  const loadShopData = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      // Firestore'dan bu kullanıcıya ait işletmeyi bul
      const shopsQuery = query(collection(db, 'shops'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(shopsQuery);
      
      if (!snapshot.empty) {
        const shopDoc = snapshot.docs[0];
        const data = shopDoc.data();
        setSlug(data.slug || '');
        setName(data.name || '');
        setAddress(data.address || '');
        setOpeningHour(data.workingHours?.start || '09:00');
        setClosingHour(data.workingHours?.end || '20:00');
        setWorkingDays(data.workingDays || [1, 2, 3, 4, 5, 6]);
        setTimezone(data.timezone || 'Europe/Istanbul');
        setDescription(data.description || '');
        setPhotos(data.photos || []);
        setStaff(data.staff || []);
        setInstagramUrl(data.instagramUrl || '');
        // Services formatını dönüştür: { name, duration, price } -> { id, name, duration, price }
        const formattedServices = (data.services || []).map((s: any, idx: number) => ({
          id: idx.toString(),
          name: s.name || '',
          duration: s.duration || 60,
          price: s.price || 0,
        }));
        setServices(formattedServices.length > 0 ? formattedServices : [{ id: '0', name: '', duration: 60, price: 0 }]);
      } else {
        // Yeni işletme - varsayılan değerler
        setServices([{ id: '0', name: '', duration: 60, price: 0 }]);
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
      Alert.alert('Hata', 'İşletme bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets?.length) {
      setPhotos((p) => [...p, result.assets[0].uri]);
    }
  };

  const removePhoto = (uri: string) => setPhotos((p) => p.filter((x) => x !== uri));

  const addService = () =>
    setServices((s) => [...s, { id: Math.random().toString(36).slice(2), name: '', duration: 60, price: 0 }]);

  const updateService = (id: string, patch: Partial<ServiceItem>) =>
    setServices((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const removeService = (id: string) => setServices((s) => s.filter((it) => it.id !== id));

  const addStaff = () => {
    if (staffName.trim() && !staff.includes(staffName.trim())) {
      setStaff((prev) => [...prev, staffName.trim()]);
      setStaffName('');
    }
  };

  const removeStaff = (index: number) => {
    setStaff((prev) => prev.filter((_, i) => i !== index));
  };

  const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!address.trim()) return null;
    
    try {
      const apiKey = 'AIzaSyCEtk1HSycs-zPTNAQxrkLqBBw45tERfCQ';
      
      // Adrese şehir bilgisi ekle (İstanbul varsayılan, eğer yoksa)
      let fullAddress = address.trim();
      if (!fullAddress.toLowerCase().includes('istanbul') && 
          !fullAddress.toLowerCase().includes('ankara') &&
          !fullAddress.toLowerCase().includes('izmir') &&
          !fullAddress.toLowerCase().includes('bursa') &&
          !fullAddress.toLowerCase().includes('antalya')) {
        // Şehir adı yoksa İstanbul ekle
        fullAddress = `İstanbul, ${fullAddress}`;
      }
      
      const encodedAddress = encodeURIComponent(fullAddress);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=tr&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('Geocoding: No results found for address:', address);
        return null;
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('Geocoding API error: Request denied. Check API key and permissions.');
        return null;
      } else {
        console.error('Geocoding API error:', data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Uyarı', 'Lütfen işletme adını girin');
      return;
    }

    if (!user?.uid) {
      Alert.alert('Hata', 'Giriş yapmanız gerekmektedir');
      return;
    }

    // Slug oluştur (yoksa)
      const finalSlug = slug.trim() || generateSlug(name);
      if (!finalSlug) {
        Alert.alert('Uyarı', 'Geçerli bir slug oluşturulamadı. Lütfen işletme adını değiştirin.');
        return;
      }

    setSaving(true);
    try {
      // Adres varsa koordinatları çıkar
      let location = null;
      if (address.trim()) {
        const coords = await geocodeAddress(address);
        if (coords) {
          location = { latitude: coords.latitude, longitude: coords.longitude };
        } else {
          Alert.alert(
            'Adres Bulunamadı',
            'Girdiğiniz adres bulunamadı. Lütfen tam adres giriniz (örn: "Kadıköy, İstanbul" veya "Atatürk Bulvarı No:5, Çankaya, Ankara").\n\nMekan koordinatları olmadan kaydedilecek.',
            [{ text: 'Tamam' }]
          );
        }
      }

      // Services formatını dönüştür: { id, name, duration, price } -> { name, duration, price }
      const formattedServices = services
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          duration: s.duration || 60,
          price: s.price || 0,
        }));

      if (formattedServices.length === 0) {
        Alert.alert('Uyarı', 'En az bir hizmet eklemeniz gerekmektedir');
        setSaving(false);
        return;
      }

      // Firestore'a kaydet
      const shopData = {
        ownerId: user.uid,
        name: name.trim(),
        slug: finalSlug,
        address: address.trim() || '',
        location: location || null,
        description: description.trim() || '',
        services: formattedServices,
        workingHours: {
          start: openingHour,
          end: closingHour,
        },
        workingDays: workingDays.sort((a, b) => a - b),
        timezone: timezone,
        photos: photos,
        staff: staff.length > 0 ? staff : undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        isPaymentActive: true, // Bu sayfaya erişebildiyse zaten aktif
        shareUrl: `https://onlinerandevum.com/book/${finalSlug}`,
        updatedAt: serverTimestamp(),
      };

      // Mevcut shop varsa kontrol et (slug değişmiş olabilir)
      const existingQuery = query(collection(db, 'shops'), where('ownerId', '==', user.uid));
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        const existingDoc = existingSnapshot.docs[0];
        const existingData = existingDoc.data();
        
        // Slug değişmişse eski dokümanı sil
        if (existingData.slug !== finalSlug) {
          await setDoc(doc(db, 'shops', finalSlug), shopData);
          // Eski dokümanı sil (eğer farklı ID'deyse)
          if (existingDoc.id !== finalSlug) {
            await setDoc(doc(db, 'shops', existingDoc.id), { ...shopData, _deleted: true }, { merge: true });
          }
        } else {
          // Aynı slug, güncelle
          await setDoc(doc(db, 'shops', finalSlug), shopData, { merge: true });
        }
      } else {
        // Yeni işletme
        await setDoc(doc(db, 'shops', finalSlug), {
          ...shopData,
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert('Başarılı', 'İşletme bilgileri kaydedildi!', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Hata', error.message || 'Kaydetme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#64748b' }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color="#fff" />
          <Text style={styles.backText}>Geri Dön</Text>
        </TouchableOpacity>
        <Text style={styles.title}>İşletme Bilgileri</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={styles.body}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>İşletme Adı</Text>
          <TextInput 
            style={styles.input} 
            placeholder="İşletme adınızı girin" 
            placeholderTextColor="#94a3b8"
            value={name} 
            onChangeText={setName} 
          />
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Adres</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Tam adres bilgisi" 
            placeholderTextColor="#94a3b8"
            value={address} 
            onChangeText={setAddress} 
          />
        </View>

        <View style={styles.timeRow}>
          <View style={[styles.inputCard, styles.timeCard]}>
            <Text style={styles.label}>Açılış Saati</Text>
            <TextInput
              style={styles.input}
              placeholder="09:00"
              placeholderTextColor="#94a3b8"
              value={openingHour}
              onChangeText={setOpeningHour}
            />
          </View>
          <View style={[styles.inputCard, styles.timeCard]}>
            <Text style={styles.label}>Kapanış Saati</Text>
            <TextInput
              style={styles.input}
              placeholder="20:00"
              placeholderTextColor="#94a3b8"
              value={closingHour}
              onChangeText={setClosingHour}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="calendar" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Çalışma Günleri</Text>
          </View>
          <View style={styles.workingDaysContainer}>
            {WEEK_DAYS.map((day) => (
              <TouchableOpacity
                key={day.value}
                style={[styles.dayButton, workingDays.includes(day.value) && styles.dayButtonActive]}
                onPress={() => {
                  if (workingDays.includes(day.value)) {
                    setWorkingDays(workingDays.filter((d) => d !== day.value));
                  } else {
                    setWorkingDays([...workingDays, day.value].sort((a, b) => a - b));
                  }
                }}
              >
                <Text style={[styles.dayButtonText, workingDays.includes(day.value) && styles.dayButtonTextActive]}>
                  {day.label.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            multiline
            placeholder="İşletmeniz hakkında kısa bilgi..."
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="camera.fill" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>İşletme Fotoğrafları</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Müşterilerin göreceği fotoğrafları ekleyin</Text>
          <View style={styles.photosRow}>
            {photos.map((uri) => (
              <TouchableOpacity key={uri} onLongPress={() => removePhoto(uri)} style={styles.photoWrap}>
                <Image source={{ uri }} style={styles.photo} />
                <View style={styles.photoOverlay}>
                  <Text style={styles.photoRemoveHint}>Uzun basarak sil</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.photoWrap, styles.addPhoto]} onPress={addPhoto}>
              <IconSymbol name="camera.fill" size={28} color="#dc2626" />
              <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="tag.fill" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Fiyat Menüsü</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Hizmetlerinizi ve fiyatlarınızı ekleyin</Text>
          {services.map((s) => (
            <View key={s.id} style={styles.serviceRow}>
              <TextInput
                style={[styles.input, styles.serviceName]}
                placeholder="Hizmet adı"
                placeholderTextColor="#94a3b8"
                value={s.name}
                onChangeText={(t) => updateService(s.id, { name: t })}
              />
              <TextInput
                style={[styles.input, styles.serviceDuration]}
                placeholder="Dk"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={s.duration.toString()}
                onChangeText={(t) => updateService(s.id, { duration: parseInt(t) || 60 })}
              />
              <TextInput
                style={[styles.input, styles.servicePrice]}
                placeholder="₺"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={s.price.toString()}
                onChangeText={(t) => updateService(s.id, { price: parseInt(t) || 0 })}
              />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeService(s.id)}>
                <IconSymbol name="trash.fill" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.secondaryBtn} onPress={addService}><Text style={styles.secondaryText}>+ Hizmet ekle</Text></TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="person.fill" size={20} color="#1e293b" />
            <Text style={styles.sectionTitle}>Personel</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Personel ekleyin (isteğe bağlı)</Text>
          <View style={styles.staffInputRow}>
            <TextInput
              style={[styles.input, styles.staffInput]}
              placeholder="Personel adı"
              placeholderTextColor="#94a3b8"
              value={staffName}
              onChangeText={setStaffName}
              onSubmitEditing={addStaff}
            />
            <TouchableOpacity style={styles.secondaryBtn} onPress={addStaff}>
              <Text style={styles.secondaryText}>+ Ekle</Text>
            </TouchableOpacity>
          </View>
          {staff.length > 0 && (
            <View style={styles.staffList}>
              {staff.map((name, index) => (
                <View key={index} style={styles.staffItem}>
                  <Text style={styles.staffItemText}>{name}</Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeStaff(index)}
                  >
                    <IconSymbol name="trash.fill" size={16} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Instagram URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://instagram.com/..."
            placeholderTextColor="#94a3b8"
            value={instagramUrl}
            onChangeText={setInstagramUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
          <Text style={styles.hintText}>
            İşletmenizin Instagram profil linkini ekleyin (isteğe bağlı)
          </Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.label}>Paylaşılabilir Slug</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek-isletme"
            placeholderTextColor="#94a3b8"
            value={slug}
            onChangeText={(t) => setSlug(t.replace(/\s+/g, '-').toLowerCase())}
          />
          <Text style={styles.hintText}>
            Boş bırakılırsa işletme adından otomatik oluşturulur
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
          onPress={save} 
          disabled={saving}
          activeOpacity={0.7}
        >
          <Text style={styles.saveText}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { 
    padding: 20, 
    paddingTop: 70, 
    paddingBottom: 24,
    backgroundColor: '#dc2626', 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8,
    marginRight: 12,
  },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', flex: 1, letterSpacing: -0.3 },
  headerRight: {
    width: 100,
    marginLeft: 12,
  },
  body: { padding: 20, paddingBottom: 40 },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: { 
    fontSize: 14, 
    color: '#1e293b', 
    marginBottom: 10, 
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  input: { 
    backgroundColor: '#f8fafc', 
    borderWidth: 1.5, 
    borderColor: '#e2e8f0', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeCard: {
    flex: 1,
    marginBottom: 0,
  },
  textarea: { 
    minHeight: 100, 
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  sectionCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 12, 
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1e293b', 
    letterSpacing: -0.3,
  },
  sectionSubtitle: { 
    fontSize: 13, 
    color: '#64748b', 
    marginBottom: 16, 
    fontWeight: '500',
    marginLeft: 30,
  },
  photosRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrap: { 
    width: 110, 
    height: 110, 
    borderRadius: 16, 
    overflow: 'hidden', 
    backgroundColor: '#f8fafc', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  photo: { width: '100%', height: '100%' },
  photoOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    paddingVertical: 6, 
    paddingHorizontal: 8,
  },
  photoRemoveHint: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: '600', 
    textAlign: 'center',
  },
  addPhoto: { 
    borderWidth: 2, 
    borderColor: '#dc2626', 
    borderStyle: 'dashed', 
    backgroundColor: '#fef2f2',
  },
  addPhotoText: { 
    color: '#dc2626', 
    fontWeight: '700', 
    fontSize: 13,
    marginTop: 6,
  },
  serviceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    gap: 8,
  },
  serviceName: { 
    flex: 1, 
    marginRight: 0,
  },
  serviceDuration: { 
    width: 90, 
    marginRight: 0, 
    textAlign: 'center',
  },
  servicePrice: { 
    width: 100, 
    marginRight: 0, 
    textAlign: 'right',
  },
  workingDaysContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10,
  },
  dayButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  removeBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 14, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: '#fecaca', 
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { 
    color: '#dc2626', 
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: { 
    alignSelf: 'flex-start', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: '#dc2626', 
    backgroundColor: '#fef2f2',
    marginTop: 8,
  },
  secondaryText: { 
    color: '#dc2626', 
    fontWeight: '700',
    fontSize: 15,
  },
  saveBtn: { 
    backgroundColor: '#dc2626', 
    padding: 18, 
    borderRadius: 16, 
    marginTop: 24,
    marginBottom: 20,
    shadowColor: '#dc2626', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 12, 
    elevation: 6,
  },
  saveBtnDisabled: { 
    backgroundColor: '#94a3b8', 
    shadowOpacity: 0,
  },
  saveText: { 
    color: '#fff', 
    fontWeight: '800', 
    textAlign: 'center', 
    fontSize: 17,
    letterSpacing: -0.3,
  },
  staffInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  staffInput: {
    flex: 1,
    marginBottom: 0,
  },
  staffList: {
    marginTop: 12,
    gap: 8,
  },
  staffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  staffItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
});


