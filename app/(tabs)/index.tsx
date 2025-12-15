import { AnimatedTabScreen } from '@/components/animated-tab-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type FilterType = 'all' | 'nearby' | 'highRated' | 'popular' | 'new';

export default function HomeScreen() {
  const [savedShops, setSavedShops] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();
  }, []);

  // Debounce search query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadSavedShops();
    }, [])
  );

  const loadSavedShops = async () => {
    try {
      // Firestore'dan tüm işletmeleri yükle (isPaymentActive kontrolü client-side'da yapılacak)
      // Hem aktif olanları hem de isPaymentActive field'ı olmayanları (web'den eklenen eski kayıtlar) göster
      const shopsSnapshot = await getDocs(collection(db, 'shops'));
      
      const firestoreShops = shopsSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            slug: data.slug || doc.id,
            name: data.name || '',
            address: data.address || '',
            description: data.description || '',
            category: data.category || '',
            photos: data.photos || [],
            services: data.services || [],
            coordinates: data.location ? { latitude: data.location.latitude, longitude: data.location.longitude } : null,
            workingHours: data.workingHours ? `${data.workingHours.start} - ${data.workingHours.end}` : '',
            rating: data.rating || null,
            totalRatings: data.totalRatings || 0,
            // isPaymentActive field'ı yoksa veya true ise göster (web'den eklenen işletmeler için)
            isPaymentActive: data.isPaymentActive !== undefined ? data.isPaymentActive : true,
            ownerId: data.ownerId || '',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          };
        })
        // Sadece isPaymentActive true olanları veya field'ı olmayanları göster
        .filter((shop) => shop.isPaymentActive !== false);

      // Google Places API'den gelen shops'ları AsyncStorage'dan yükle
      const allShopsData = await AsyncStorage.getItem('allShops');
      const googlePlacesShops: any[] = [];
      if (allShopsData) {
        const allShops = JSON.parse(allShopsData);
        // Sadece placeId olanları (Google Places API'den gelenler) al
        googlePlacesShops.push(...allShops.filter((shop: any) => shop.placeId));
      }

      // Firestore shops ve Google Places shops'ları birleştir
      const combinedShops = [...firestoreShops, ...googlePlacesShops];
      setSavedShops(combinedShops);
    } catch (error) {
      console.error('Error loading shops:', error);
      // Hata durumunda AsyncStorage'dan yükle (fallback)
      try {
        const allShopsData = await AsyncStorage.getItem('allShops');
        if (allShopsData) {
          setSavedShops(JSON.parse(allShopsData));
        } else {
          setSavedShops([]);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setSavedShops([]);
      }
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredShops = useMemo(() => {
    let filtered = [...savedShops];

    // Filtreye göre sıralama
    switch (selectedFilter) {
      case 'nearby':
        if (userLocation && userLocation.coords) {
          filtered = filtered
            .filter(shop => shop.coordinates)
            .map(shop => ({
              ...shop,
              distance: calculateDistance(
                userLocation.coords.latitude,
                userLocation.coords.longitude,
                shop.coordinates.latitude,
                shop.coordinates.longitude
              )
            }))
            .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        } else {
          filtered = [];
        }
        break;
      case 'highRated':
        filtered = filtered
          .filter(shop => shop.rating && shop.rating >= 4.5)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered = filtered
          .filter(shop => shop.rating || shop.totalRatings)
          .sort((a, b) => {
            const scoreA = (a.rating || 0) * (a.totalRatings || 0);
            const scoreB = (b.rating || 0) * (b.totalRatings || 0);
            return scoreB - scoreA;
          });
        break;
      case 'new':
        // Son eklenenler (şimdilik tümünü göster, ileride tarih eklenebilir)
        filtered = filtered.reverse();
        break;
      default:
        // 'all' - tümünü göster
        break;
    }

    // Kategori filtresi
    if (selectedCategory) {
      // Kategori isimlerini eşleştir (esnek eşleştirme)
      const categoryMap: { [key: string]: string[] } = {
        'Berber': ['Berber', 'berber'],
        'Güzellik': ['Güzellik Salonu', 'Güzellik', 'güzellik salonu', 'güzellik'],
        'Manikür': ['Manikür', 'manikür', 'Nailart', 'nailart'],
        'Cilt Bakımı': ['Cilt Bakımı', 'cilt bakımı', 'Güzellik Salonu', 'güzellik salonu'],
        'Nailart': ['Nailart', 'nailart', 'Manikür', 'manikür'],
        'Pilates': ['Pilates', 'pilates'],
        'Psikolog': ['Psikolog', 'psikolog'],
        'Terapi': ['Terapi', 'terapi', 'Psikolog', 'psikolog'],
        'Diş Hekimi': ['Diş Hekimi', 'diş hekimi'],
        'Fizyoterapist': ['Fizyoterapist', 'fizyoterapist'],
        'Masaj': ['Masaj', 'masaj'],
        'Estetik': ['Estetik', 'estetik'],
        'Kuaför': ['Kuaför', 'kuaför'],
        'Yoga': ['Yoga', 'yoga'],
        'Fitness': ['Fitness', 'fitness'],
        'Diyetisyen': ['Diyetisyen', 'diyetisyen'],
        'Veteriner': ['Veteriner', 'veteriner'],
        'Sauna': ['Sauna', 'sauna'],
      };
      
      const categoryVariants = categoryMap[selectedCategory] || [selectedCategory];
      filtered = filtered.filter((shop) => {
        const shopCategory = shop.category || '';
        return categoryVariants.some(cat => 
          shopCategory.toLowerCase().includes(cat.toLowerCase())
        );
      });
    }

    // Arama sorgusu varsa filtrele (debounced search query kullan)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((shop) => {
        const nameMatch = shop.name?.toLowerCase().includes(query);
        const addressMatch = shop.address?.toLowerCase().includes(query);
        const categoryMatch = shop.category?.toLowerCase().includes(query);
        const serviceMatch = shop.services?.some((s: any) =>
          s.name?.toLowerCase().includes(query)
        );
        return nameMatch || addressMatch || categoryMatch || serviceMatch;
      });
    }

    return filtered;
  }, [savedShops, selectedFilter, userLocation, debouncedSearchQuery, selectedCategory]);

  return (
    <AnimatedTabScreen>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        {selectedCategory || debouncedSearchQuery.trim() ? (
          <TouchableOpacity 
            onPress={() => {
              // Debounce timer'ı temizle
              if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
                debounceTimer.current = null;
              }
              // State'leri sıfırla
              setSearchQuery('');
              setDebouncedSearchQuery('');
              setSelectedCategory(null);
              // Filter'ı da sıfırla
              setSelectedFilter('all');
            }}
            style={styles.headerBackButton}
            activeOpacity={0.6}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="chevron.left" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerLeft} />
        )}
        <Text style={styles.title}>Randevum</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/settings/notifications')}
        >
          <IconSymbol name="bell" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="İşletme, hizmet veya kategori ara..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            blurOnSubmit={false}
            clearButtonMode="while-editing"
            textContentType="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory} İşletmeleri` : debouncedSearchQuery.trim() ? 'Arama Sonuçları' : 'Hizmet Kategorileri'}
          </Text>
        </View>
        
        {!selectedCategory ? (
          <>
            {(() => {
              const allCategories = [
                { name: 'Berber', icon: 'scissors', color: '#ef4444', bgColor: '#fef2f2', gradient: ['#fee2e2', '#fef2f2'] },
                { name: 'Güzellik', icon: 'sparkles', color: '#10b981', bgColor: '#d1fae5', gradient: ['#a7f3d0', '#d1fae5'] },
                { name: 'Manikür', icon: 'hand.raised', color: '#f59e0b', bgColor: '#fef3c7', gradient: ['#fde68a', '#fef3c7'] },
                { name: 'Cilt Bakımı', icon: 'face.smiling', color: '#8b5cf6', bgColor: '#ede9fe', gradient: ['#ddd6fe', '#ede9fe'] },
                { name: 'Nailart', icon: 'paintbrush.fill', color: '#ec4899', bgColor: '#fce7f3', gradient: ['#fbcfe8', '#fce7f3'] },
                { name: 'Pilates', icon: 'figure.flexibility', color: '#06b6d4', bgColor: '#cffafe', gradient: ['#a5f3fc', '#cffafe'] },
                { name: 'Psikolog', icon: 'brain.head.profile', color: '#6366f1', bgColor: '#e0e7ff', gradient: ['#c7d2fe', '#e0e7ff'] },
                { name: 'Terapi', icon: 'heart.fill', color: '#f43f5e', bgColor: '#ffe4e6', gradient: ['#fecdd3', '#ffe4e6'] },
                { name: 'Diş Hekimi', icon: 'mouth.fill', color: '#14b8a6', bgColor: '#ccfbf1', gradient: ['#5eead4', '#ccfbf1'] },
                { name: 'Fizyoterapist', icon: 'figure.walk', color: '#f97316', bgColor: '#ffedd5', gradient: ['#fdba74', '#ffedd5'] },
                { name: 'Masaj', icon: 'hand.point.up.left.fill', color: '#a855f7', bgColor: '#f3e8ff', gradient: ['#c084fc', '#f3e8ff'] },
                { name: 'Estetik', icon: 'sparkles', color: '#d946ef', bgColor: '#fae8ff', gradient: ['#e879f9', '#fae8ff'] },
                { name: 'Kuaför', icon: 'scissors', color: '#0ea5e9', bgColor: '#e0f2fe', gradient: ['#7dd3fc', '#e0f2fe'] },
                { name: 'Yoga', icon: 'figure.yoga', color: '#84cc16', bgColor: '#ecfccb', gradient: ['#bef264', '#ecfccb'] },
                { name: 'Fitness', icon: 'dumbbell.fill', color: '#e11d48', bgColor: '#ffe4e6', gradient: ['#fda4af', '#ffe4e6'] },
                { name: 'Diyetisyen', icon: 'leaf.fill', color: '#22c55e', bgColor: '#dcfce7', gradient: ['#86efac', '#dcfce7'] },
                { name: 'Veteriner', icon: 'pawprint.fill', color: '#f59e0b', bgColor: '#fef3c7', gradient: ['#fde68a', '#fef3c7'] },
                { name: 'Sauna', icon: 'drop.fill', color: '#3b82f6', bgColor: '#dbeafe', gradient: ['#93c5fd', '#dbeafe'] },
              ];
              
              // Arama sorgusu varsa kategorileri filtrele
              const filteredCategories = debouncedSearchQuery.trim()
                ? allCategories.filter(cat => 
                    cat.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                  )
                : allCategories;
              
              return filteredCategories.length > 0 ? (
                <View style={styles.categoriesGrid}>
                  {filteredCategories.map((category, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.categoryCardGrid}
                      onPress={() => setSelectedCategory(category.name)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.categoryCardInner, { backgroundColor: category.bgColor }]}>
                        <View style={[styles.categoryIconGrid, { backgroundColor: category.color + '15' }]}>
                          <IconSymbol name={category.icon as any} size={24} color={category.color} />
                        </View>
                        <Text style={styles.categoryTextGrid}>{category.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null;
            })()}

            {/* Öne Çıkan İşletmeler */}
            {savedShops.length > 0 && (
              <View style={styles.featuredContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Öne Çıkan İşletmeler</Text>
                  <TouchableOpacity onPress={() => setSelectedFilter('highRated')}>
                    <Text style={styles.seeAllText}>Tümünü Gör</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.featuredScrollView}
                  contentContainerStyle={styles.featuredScrollContent}
                >
                  {savedShops
                    .filter(shop => shop.rating && shop.rating >= 4.5)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 5)
                    .map((shop, index) => (
                      <TouchableOpacity 
                        key={shop.slug || shop.id || shop.placeId || index} 
                        style={styles.featuredCard} 
                        onPress={() => router.push({
                          pathname: '/shop/[id]',
                          params: { id: shop.slug || shop.id || shop.placeId || shop.name || index.toString() }
                        })}
                      >
                        {shop.photos && shop.photos.length > 0 ? (
                          <Image source={{ uri: shop.photos[0] }} style={styles.featuredImage} />
                        ) : (
                          <View style={[styles.featuredImage, styles.featuredImagePlaceholder]}>
                            <IconSymbol name="building.2.fill" size={32} color="#ef4444" />
                          </View>
                        )}
                        <View style={styles.featuredOverlay}>
                          <Text style={styles.featuredName} numberOfLines={1}>{shop.name}</Text>
                          {shop.rating && (
                            <View style={styles.featuredRating}>
                              <IconSymbol name="star.fill" size={12} color="#fbbf24" />
                              <Text style={styles.featuredRatingText}>{shop.rating.toFixed(1)}</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}
            
            {/* Arama sonuçları - İşletmeler */}
            {debouncedSearchQuery.trim() && filteredShops.length > 0 && (
              <View style={styles.popularContainer}>
                <Text style={styles.sectionTitle}>İşletmeler</Text>
                {filteredShops.map((shop, index) => (
                  <TouchableOpacity 
                    key={shop.slug || shop.id || shop.placeId || index} 
                    style={styles.shopCard} 
                    onPress={() => router.push({
                      pathname: '/shop/[id]',
                      params: { id: shop.slug || shop.id || shop.placeId || shop.name || index.toString() }
                    })}
                  >
                    {shop.photos && shop.photos.length > 0 ? (
                      <Image source={{ uri: shop.photos[0] }} style={styles.shopImage} />
                    ) : (
                      <View style={styles.shopImage}>
                        <IconSymbol name="building.2.fill" size={32} color="#ef4444" />
                      </View>
                    )}
                    <View style={styles.shopInfo}>
                      <View style={styles.shopHeader}>
                        <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                        {shop.rating && (
                          <View style={styles.ratingBadge}>
                            <IconSymbol name="star.fill" size={12} color="#fbbf24" />
                            <Text style={styles.ratingText}>{shop.rating.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                      
                      {(shop.distance !== undefined) && (
                        <View style={styles.distanceBadge}>
                          <IconSymbol name="location.fill" size={12} color="#ef4444" />
                          <Text style={styles.distanceText}>{shop.distance.toFixed(1)} km</Text>
                        </View>
                      )}
                      
                      {shop.address ? (
                        <Text style={styles.shopAddress} numberOfLines={1}>{shop.address}</Text>
                      ) : null}
                      {shop.workingHours ? (
                        <Text style={styles.shopHours}>{shop.workingHours}</Text>
                      ) : null}
                      {shop.services && shop.services.length > 0 && (
                        <Text style={styles.shopServices} numberOfLines={1}>
                          {shop.services.slice(0, 2).map((s: any) => s.name).join(', ')}
                          {shop.services.length > 2 && '...'}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.bookButton, !shop.isPaymentActive && styles.bookButtonDisabled]}
                      onPress={() => {
                        if (!shop.isPaymentActive) {
                          Alert.alert('Abonelik Gerekli', 'Bu işletme abonelik satın almadığı için uygulama üzerinden randevu alınamaz.');
                          return;
                        }
                        router.push({ pathname: '/booking', params: { shopId: shop.slug || shop.id || shop.placeId || shop.name || index.toString() } });
                      }}
                      disabled={!shop.isPaymentActive}
                    >
                      <Text
                        style={[styles.bookButtonText, !shop.isPaymentActive && styles.bookButtonTextDisabled]}
                      >
                        Randevu Al
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : null}
      </View>

      {selectedCategory && (
        <View style={styles.popularContainer}>
          <Text style={styles.sectionTitle}>İşletmeler</Text>
        
        {/* Kategori Filtreleri */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <IconSymbol 
              name="square.grid.2x2" 
              size={16} 
              color={selectedFilter === 'all' ? '#fff' : '#64748b'} 
            />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.filterButtonTextActive
            ]}>
              Tümü
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'nearby' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter('nearby')}
          >
            <IconSymbol 
              name="location.fill" 
              size={16} 
              color={selectedFilter === 'nearby' ? '#fff' : '#64748b'} 
            />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'nearby' && styles.filterButtonTextActive
            ]}>
              Yakınımdakiler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'highRated' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter('highRated')}
          >
            <IconSymbol 
              name="star.fill" 
              size={16} 
              color={selectedFilter === 'highRated' ? '#fff' : '#fbbf24'} 
            />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'highRated' && styles.filterButtonTextActive
            ]}>
              Yüksek Puan
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'popular' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter('popular')}
          >
            <IconSymbol 
              name="flame.fill" 
              size={16} 
              color={selectedFilter === 'popular' ? '#fff' : '#ef4444'} 
            />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'popular' && styles.filterButtonTextActive
            ]}>
              Popüler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'new' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter('new')}
          >
            <IconSymbol 
              name="sparkles" 
              size={16} 
              color={selectedFilter === 'new' ? '#fff' : '#8b5cf6'} 
            />
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'new' && styles.filterButtonTextActive
            ]}>
              Yeni
            </Text>
          </TouchableOpacity>
        </ScrollView>
        
        {filteredShops.length > 0 ? (
          filteredShops.map((shop, index) => (
            <TouchableOpacity 
              key={shop.slug || shop.id || shop.placeId || index} 
              style={styles.shopCard} 
              onPress={() => router.push({
                pathname: '/shop/[id]',
                params: { id: shop.slug || shop.id || shop.placeId || shop.name || index.toString() }
              })}
            >
              {shop.photos && shop.photos.length > 0 ? (
                <Image source={{ uri: shop.photos[0] }} style={styles.shopImage} />
              ) : (
                <View style={styles.shopImage}>
                  <IconSymbol name="building.2.fill" size={32} color="#ef4444" />
                </View>
              )}
              <View style={styles.shopInfo}>
                <View style={styles.shopHeader}>
                  <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                  {shop.rating && (
                    <View style={styles.ratingBadge}>
                      <IconSymbol name="star.fill" size={12} color="#fbbf24" />
                      <Text style={styles.ratingText}>{shop.rating.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
                
                {(shop.distance !== undefined) && (
                  <View style={styles.distanceBadge}>
                    <IconSymbol name="location.fill" size={12} color="#ef4444" />
                    <Text style={styles.distanceText}>{shop.distance.toFixed(1)} km</Text>
                  </View>
                )}
                
                {shop.address ? (
                  <Text style={styles.shopAddress} numberOfLines={1}>{shop.address}</Text>
                ) : null}
                {shop.workingHours ? (
                  <Text style={styles.shopHours}>{shop.workingHours}</Text>
                ) : null}
                {shop.services && shop.services.length > 0 && (
                  <Text style={styles.shopServices} numberOfLines={1}>
                    {shop.services.slice(0, 2).map((s: any) => s.name).join(', ')}
                    {shop.services.length > 2 && '...'}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.bookButton, !shop.isPaymentActive && styles.bookButtonDisabled]}
                onPress={() => {
                  if (!shop.isPaymentActive) {
                    Alert.alert('Abonelik Gerekli', 'Bu işletme abonelik satın almadığı için uygulama üzerinden randevu alınamaz.');
                    return;
                  }
                  router.push({ pathname: '/booking', params: { shopId: shop.slug || shop.id || shop.placeId || shop.name || index.toString() } });
                }}
                disabled={!shop.isPaymentActive}
              >
                <Text
                  style={[styles.bookButtonText, !shop.isPaymentActive && styles.bookButtonTextDisabled]}
                >
                  Randevu Al
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : debouncedSearchQuery.trim() ? (
          <View style={styles.emptyShops}>
            <IconSymbol name="magnifyingglass" size={48} color="#cbd5e1" />
            <Text style={styles.emptyShopsText}>Sonuç bulunamadı</Text>
            <Text style={styles.emptyShopsSubtext}>
              "{debouncedSearchQuery}" için arama sonucu bulunamadı
            </Text>
          </View>
        ) : selectedFilter === 'nearby' && !userLocation ? (
          <View style={styles.emptyShops}>
            <IconSymbol name="location.slash" size={48} color="#cbd5e1" />
            <Text style={styles.emptyShopsText}>Konum erişimi gerekli</Text>
            <Text style={styles.emptyShopsSubtext}>Yakınımdakiler listesini görmek için konum izni vermeniz gerekiyor</Text>
          </View>
        ) : selectedFilter === 'nearby' ? (
          <View style={styles.emptyShops}>
            <IconSymbol name="location" size={48} color="#cbd5e1" />
            <Text style={styles.emptyShopsText}>Yakınında dükkan bulunamadı</Text>
            <Text style={styles.emptyShopsSubtext}>Yakınınızda henüz dükkan bulunmuyor</Text>
          </View>
        ) : selectedFilter === 'highRated' ? (
          <View style={styles.emptyShops}>
            <IconSymbol name="star" size={48} color="#cbd5e1" />
            <Text style={styles.emptyShopsText}>Yüksek puanlı dükkan bulunamadı</Text>
            <Text style={styles.emptyShopsSubtext}>4.5 ve üzeri puanlı dükkan bulunmuyor</Text>
          </View>
        ) : (
          <View style={styles.emptyShops}>
            <IconSymbol name="building.2" size={48} color="#cbd5e1" />
            <Text style={styles.emptyShopsText}>Henüz dükkan eklenmemiş</Text>
            <Text style={styles.emptyShopsSubtext}>Profil sayfasından "Mekan Ekle" butonuna tıklayarak dükkanınızı ekleyebilirsiniz</Text>
          </View>
        )}
        </View>
      )}
      </ScrollView>
    </AnimatedTabScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
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
  headerBackButton: {
    width: 40,
    height: 40,
    minWidth: 40,
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 70,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  searchContainer: {
    padding: 24,
    paddingTop: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  categoriesScrollView: {
    marginHorizontal: -20,
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
    gap: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  categoryCardGrid: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 10,
  },
  categoryCardInner: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  categoryIconGrid: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTextGrid: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.3,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryCard: {
    width: 90,
    backgroundColor: '#fafbfc',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8ecf0',
    marginRight: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: -0.2,
    textAlign: 'center',
    lineHeight: 16,
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  featuredScrollView: {
    marginHorizontal: -20,
  },
  featuredScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
    gap: 16,
  },
  featuredCard: {
    width: 280,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  featuredImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  featuredName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
  },
  categorySubtext: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  popularContainer: {
    padding: 24,
    paddingTop: 0,
  },
  filtersContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  filtersContent: {
    paddingRight: 24,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  shopCard: {
    backgroundColor: '#fafbfc',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e8ecf0',
  },
  shopImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  shopInfo: {
    flex: 1,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginLeft: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991b1b',
    marginLeft: 4,
  },
  shopAddress: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  shopHours: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  shopServices: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  emptyShops: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  emptyShopsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyShopsSubtext: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bookButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowColor: '#cbd5e1',
    shadowOpacity: 0.1,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: -0.1,
  },
  bookButtonTextDisabled: {
    color: '#64748b',
  },
});
