import { IconSymbol } from '@/components/ui/icon-symbol';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [shopData, setShopData] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isPaymentActive, setIsPaymentActive] = useState(false);
  
  // Firestore Reviews State
  const [firestoreReviews, setFirestoreReviews] = useState<any[]>([]);
  const [loadingFirestoreReviews, setLoadingFirestoreReviews] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  
  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadShopData();
    checkFavoriteStatus();
  }, [id]);

  useEffect(() => {
    if (shopData) {
      checkPaymentStatus();
    }
  }, [shopData]);

  useEffect(() => {
    // Google Places reviews yükle (placeId varsa ve reviews yüklenmemişse)
    if (shopData?.placeId && !shopData.reviews && !loadingReviews) {
      loadPlaceReviews();
    }
  }, [shopData?.placeId, shopData?.reviews]);

  // Load Firestore Reviews
  useEffect(() => {
    if (shopData?.slug || shopData?.id) {
      loadFirestoreReviews();
    }
  }, [shopData?.slug, shopData?.id]);

  const loadShopData = async () => {
    try {
      // Önce Firestore'dan ara (web'den eklenen işletmeler için)
      if (id) {
        const decodedId = decodeURIComponent(id as string).toLowerCase().trim();
        try {
          // Slug veya ID ile Firestore'dan ara
          const shopDoc = await getDoc(doc(db, 'shops', decodedId));
          if (shopDoc.exists()) {
            const data = shopDoc.data();
            const firestoreShop = {
              id: shopDoc.id,
              slug: data.slug || shopDoc.id,
              name: data.name || '',
              address: data.address || '',
              description: data.description || '',
              photos: data.photos || [],
              services: data.services || [],
              staff: data.staff || [],
              instagramUrl: data.instagramUrl || '',
              coordinates: data.location ? { latitude: data.location.latitude, longitude: data.location.longitude } : null,
              workingHours: data.workingHours ? `${data.workingHours.start} - ${data.workingHours.end}` : '',
              rating: data.rating || null,
              totalRatings: data.totalRatings || 0,
              isPaymentActive: data.isPaymentActive !== undefined ? data.isPaymentActive : true,
              ownerId: data.ownerId || '',
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
            };
            setShopData(firestoreShop);
            return;
          }
        } catch (firestoreError) {
          console.log('[ShopDetail] Firestore error (will try other sources):', firestoreError);
        }
      }
      
      // Firestore'da bulunamazsa, AsyncStorage'dan ara (Google Places API'den gelenler)
      const allShopsData = await AsyncStorage.getItem('allShops');
      if (allShopsData) {
        const allShops = JSON.parse(allShopsData);
        // placeId, slug, name veya id ile ara
        const foundShop = allShops.find((shop: any) => 
          shop.placeId === id || 
          shop.slug === id || 
          shop.id === id ||
          shop.name === id
        );
        
        if (foundShop) {
          setShopData(foundShop);
          return;
        }
      }
      
      // Eğer allShops'ta da bulunamazsa, shopInfo'dan yükle (sadece ID eşleşiyorsa)
      const shopDataStorage = await AsyncStorage.getItem('shopInfo');
      if (shopDataStorage) {
        const parsed = JSON.parse(shopDataStorage);
        // Sadece ID, slug veya name eşleşiyorsa göster
        const matchesId = parsed.slug === decodedId || 
                         parsed.id === decodedId || 
                         parsed.placeId === decodedId ||
                         parsed.name?.toLowerCase() === decodedId;
        if (parsed.name && matchesId) {
          setShopData(parsed);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
    }
  };

  const loadPlaceReviews = async () => {
    if (!shopData?.placeId) return;
    
    // Eğer zaten yorumlar yüklenmişse tekrar yükleme
    if (shopData.reviews && shopData.reviews.length > 0) return;
    
    try {
      setLoadingReviews(true);
      const apiKey = 'AIzaSyCEtk1HSycs-zPTNAQxrkLqBBw45tERfCQ';
      
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shopData.placeId}&fields=rating,user_ratings_total,reviews,formatted_phone_number,international_phone_number&key=${apiKey}`;
      const response = await fetch(detailsUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        // Google Places API maksimum 5 yorum döndürür
        const reviews = data.result.reviews?.map((review: any) => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
        })) || [];
        
        // Mevcut shopData'yı koruyarak sadece reviews ve rating'i güncelle
        setShopData((prev: any) => ({
          ...prev,
          rating: data.result.rating || prev.rating,
          totalRatings: data.result.user_ratings_total || prev.totalRatings,
          reviews: reviews,
          phone: data.result.formatted_phone_number || data.result.international_phone_number || prev.phone,
        }));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      if (!shopData?.name) return;
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const parsed = JSON.parse(favorites);
        const isFav = parsed.some((fav: any) => fav.name === shopData.name);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      if (shopData?.isPaymentActive !== undefined) {
        setIsPaymentActive(!!shopData.isPaymentActive);
        if (shopData.placeId || shopData.isPaymentActive) {
          return;
        }
      }

      if (shopData?.placeId) {
        setIsPaymentActive(false);
        return;
      }

      // Dükkan sahibinin email'ini kontrol et
      const ownerEmail = shopData?.ownerEmail;
      if (!ownerEmail) {
        setIsPaymentActive(false);
        return;
      }

      // Business owner bilgisini kontrol et
      const businessOwner = await AsyncStorage.getItem('businessOwner');
      if (!businessOwner) {
        setIsPaymentActive(false);
        return;
      }

      const parsed = JSON.parse(businessOwner);
      setIsPaymentActive(parsed.email === ownerEmail && parsed.paymentStatus === 'active');
    } catch (error) {
      console.error('Error checking payment status:', error);
      setIsPaymentActive(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (!shopData) return;
      
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesList = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        // Favorilerden çıkar
        favoritesList = favoritesList.filter((fav: any) => fav.name !== shopData.name);
        setIsFavorite(false);
      } else {
        // Favorilere ekle
        favoritesList.push({
          id: shopData.placeId || shopData.name,
          name: shopData.name,
          address: shopData.address || '',
          workingHours: shopData.workingHours || '',
          placeId: shopData.placeId,
          ownerEmail: shopData.ownerEmail,
          isPaymentActive: isPaymentActive,
          services: shopData.services || [],
          photos: shopData.photos || [],
        });
        setIsFavorite(true);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesList));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const openDirections = () => {
    if (!shopData?.coordinates) {
      Alert.alert('Hata', 'Bu mekan için konum bilgisi bulunamadı.');
      return;
    }

    const { latitude, longitude } = shopData.coordinates;
    const label = encodeURIComponent(shopData.name || 'Mekan');
    
    let url = '';
    
    if (Platform.OS === 'ios') {
      // iOS için önce Google Maps uygulamasını dene, yoksa Apple Maps
      const googleMapsUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
      const appleMapsUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
      
      // Google Maps uygulaması var mı kontrol et
      Linking.canOpenURL(googleMapsUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(googleMapsUrl);
          } else {
            return Linking.openURL(appleMapsUrl);
          }
        })
        .catch(() => {
          // Her ikisi de başarısız olursa web URL'i kullan
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
        });
    } else {
      // Android için Google Maps navigation
      url = `google.navigation:q=${latitude},${longitude}`;
      
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(url);
          } else {
            // Google Maps uygulaması yoksa web URL'i kullan
            return Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
          }
        })
        .catch(() => {
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
        });
    }
  };

  const makePhoneCall = (phoneNumber: string) => {
    if (!phoneNumber) {
      Alert.alert('Hata', 'Telefon numarası bulunamadı.');
      return;
    }

    // Telefon numarasından sadece rakamları al
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Tel: URL scheme'i ile arama yap
    const phoneUrl = `tel:${cleanedNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Hata', 'Telefon araması yapılamıyor.');
        }
      })
      .catch((error) => {
        console.error('Error making phone call:', error);
        Alert.alert('Hata', 'Telefon araması başlatılamadı.');
      });
  };

  // Load Firestore Reviews
  const loadFirestoreReviews = async () => {
    if (!shopData) return;
    
    try {
      setLoadingFirestoreReviews(true);
      const shopSlug = shopData.slug || shopData.id;
      if (!shopSlug) return;

      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('shopId', '==', shopSlug),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setFirestoreReviews(reviews);
      
      // Calculate average rating
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, r: any) => sum + (r.rating || 0), 0);
        const avg = total / reviews.length;
        setAverageRating(avg);
        setTotalReviews(reviews.length);
      } else {
        // Use shop rating if no reviews
        setAverageRating(shopData.rating || 0);
        setTotalReviews(shopData.totalRatings || 0);
      }
    } catch (error) {
      console.error('[ShopDetail] Error loading Firestore reviews:', error);
    } finally {
      setLoadingFirestoreReviews(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Yorum yazmak için giriş yapmanız gerekiyor.');
      return;
    }
    
    if (!reviewComment.trim()) {
      Alert.alert('Uyarı', 'Lütfen yorumunuzu yazın.');
      return;
    }

    if (!shopData) return;

    try {
      setSubmittingReview(true);
      
      const shopSlug = shopData.slug || shopData.id;
      if (!shopSlug) {
        Alert.alert('Hata', 'İşletme bilgisi bulunamadı.');
        return;
      }

      const reviewData = {
        shopId: shopSlug,
        shopName: shopData.name,
        ownerId: shopData.ownerId || null,
        customerId: user.uid,
        customerName: user.displayName || user.email?.split('@')[0] || 'Anonim',
        customerEmail: user.email,
        rating: reviewRating,
        comment: reviewComment.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Update shop rating
      const newReviews = [...firestoreReviews, { ...reviewData, id: 'temp' }];
      const newTotal = newReviews.length;
      const newAvg = newReviews.reduce((sum, r: any) => sum + (r.rating || 0), 0) / newTotal;
      
      // Update shop document
      const shopDocRef = doc(db, 'shops', shopSlug);
      await updateDoc(shopDocRef, {
        rating: newAvg,
        totalRatings: newTotal,
      });
      
      // Reload reviews
      await loadFirestoreReviews();
      
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      
      Alert.alert('Başarılı', 'Yorumunuz başarıyla eklendi. Teşekkür ederiz!');
    } catch (error: any) {
      console.error('[ShopDetail] Error submitting review:', error);
      Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!shopData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={20} color="#dc2626" />
            <Text style={styles.backText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerCenter}>
          {shopData?.name && (
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              {shopData.name}
            </Text>
          )}
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <IconSymbol 
              name={isFavorite ? "heart.fill" : "heart"} 
              size={22} 
              color={isFavorite ? "#FF6B6B" : "#dc2626"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Shop Images */}
      <View style={styles.imageContainer}>
        {shopData.photos && shopData.photos.length > 0 ? (
          <Image source={{ uri: shopData.photos[0] }} style={styles.shopImage} />
        ) : (
          <View style={styles.mainImage}>
            <IconSymbol name="scissors" size={60} color="#dc2626" />
            <Text style={styles.imageText}>Dükkan Fotoğrafları</Text>
          </View>
        )}
      </View>

      {/* Shop Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.shopName}>{shopData.name}</Text>
        
        {shopData.address && (
          <View style={styles.addressContainer}>
            <IconSymbol name="location" size={16} color="#666" />
            <Text style={styles.address}>{shopData.address}</Text>
          </View>
        )}
        
        {shopData.coordinates && (
          <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
            <IconSymbol name="location.fill" size={18} color="#fff" />
            <Text style={styles.directionsButtonText}>Yol Tarifi Al</Text>
          </TouchableOpacity>
        )}
        
        {shopData.workingHours && (
          <View style={styles.hoursContainer}>
            <IconSymbol name="clock" size={16} color="#666" />
            <Text style={styles.hours}>{shopData.workingHours}</Text>
          </View>
        )}
        
        {shopData.phone && (
          <TouchableOpacity style={styles.phoneContainer} onPress={() => makePhoneCall(shopData.phone)}>
            <IconSymbol name="phone.fill" size={16} color="#dc2626" />
            <Text style={styles.phone}>{shopData.phone}</Text>
          </TouchableOpacity>
        )}
        
        {shopData.instagramUrl && (
          <TouchableOpacity 
            style={styles.instagramContainer} 
            onPress={() => {
              const url = shopData.instagramUrl.startsWith('http') 
                ? shopData.instagramUrl 
                : `https://${shopData.instagramUrl}`;
              Linking.openURL(url).catch((err) => {
                console.error('Error opening Instagram:', err);
                Alert.alert('Hata', 'Instagram linki açılamadı.');
              });
            }}
          >
            <IconSymbol name="camera.fill" size={16} color="#dc2626" />
            <Text style={styles.instagramText}>Instagram'da Takip Et</Text>
          </TouchableOpacity>
        )}
        
        {/* Rating */}
        {shopData.rating && (
          <View style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={18} color="#FFD700" />
            <Text style={styles.rating}>{shopData.rating.toFixed(1)}</Text>
            {shopData.totalRatings && (
              <Text style={styles.ratingCount}>({shopData.totalRatings} değerlendirme)</Text>
            )}
          </View>
        )}
      </View>

      {/* Firestore Reviews Section */}
      <View style={styles.reviewsContainer}>
        <View style={styles.reviewsHeader}>
          <View>
            <Text style={styles.sectionTitle}>Yorumlar</Text>
            {totalReviews > 0 && (
              <View style={styles.ratingSummary}>
                <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconSymbol
                      key={star}
                      name={star <= Math.round(averageRating) ? "star.fill" : "star"}
                      size={16}
                      color={star <= Math.round(averageRating) ? "#FFD700" : "#ccc"}
                    />
                  ))}
                </View>
                <Text style={styles.reviewCountText}>({totalReviews} değerlendirme)</Text>
              </View>
            )}
          </View>
          {user && (
            <TouchableOpacity
              style={styles.writeReviewButton}
              onPress={() => setShowReviewForm(!showReviewForm)}
            >
              <IconSymbol name="pencil" size={16} color="#dc2626" />
              <Text style={styles.writeReviewButtonText}>
                {showReviewForm ? 'İptal' : 'Yorum Yap'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Write Review Form */}
        {showReviewForm && user && (
          <View style={styles.reviewFormContainer}>
            <Text style={styles.reviewFormLabel}>Puan</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                  style={styles.starButton}
                >
                  <IconSymbol
                    name={star <= reviewRating ? "star.fill" : "star"}
                    size={32}
                    color={star <= reviewRating ? "#FFD700" : "#ccc"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.reviewFormLabel}>Yorumunuz</Text>
            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              placeholder="Deneyiminizi paylaşın..."
              value={reviewComment}
              onChangeText={setReviewComment}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              style={[styles.submitReviewButton, submittingReview && styles.submitReviewButtonDisabled]}
              onPress={handleSubmitReview}
              disabled={submittingReview || !reviewComment.trim()}
            >
              <Text style={styles.submitReviewButtonText}>
                {submittingReview ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reviews List */}
        {loadingFirestoreReviews ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Yorumlar yükleniyor...</Text>
          </View>
        ) : firestoreReviews.length === 0 ? (
          <View style={styles.emptyReviewsContainer}>
            <IconSymbol name="star" size={40} color="#ccc" />
            <Text style={styles.emptyReviewsText}>Henüz yorum yapılmamış</Text>
            <Text style={styles.emptyReviewsSubtext}>İlk yorumu siz yapın!</Text>
          </View>
        ) : (
          firestoreReviews.map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.customerName || 'Anonim'}</Text>
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconSymbol
                      key={star}
                      name={star <= (review.rating || 0) ? "star.fill" : "star"}
                      size={12}
                      color={star <= (review.rating || 0) ? "#FFD700" : "#ccc"}
                    />
                  ))}
                </View>
              </View>
              {review.comment && (
                <Text style={styles.reviewText}>{review.comment}</Text>
              )}
              {review.createdAt && (
                <Text style={styles.reviewDate}>
                  {review.createdAt.toDate ? 
                    new Date(review.createdAt.toDate()).toLocaleDateString('tr-TR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 
                    'Tarih bilgisi yok'}
                </Text>
              )}
            </View>
          ))
        )}

        {/* Google Places Reviews (if exists) */}
        {shopData.reviews && Array.isArray(shopData.reviews) && shopData.reviews.length > 0 && (
          <View style={styles.googleReviewsContainer}>
            <Text style={styles.googleReviewsTitle}>Google Yorumları</Text>
            {shopData.reviews.map((review: any, index: number) => (
              <View key={`google-${index}`} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author || 'Anonim'}</Text>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconSymbol
                        key={star}
                        name={star <= (review.rating || 0) ? "star.fill" : "star"}
                        size={12}
                        color={star <= (review.rating || 0) ? "#FFD700" : "#ccc"}
                      />
                    ))}
                  </View>
                </View>
                {review.text && (
                  <Text style={styles.reviewText}>{review.text}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Description */}
      {shopData.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Hakkında</Text>
          <Text style={styles.description}>{shopData.description}</Text>
        </View>
      )}

      {/* Services */}
      {shopData.services && shopData.services.length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Hizmetler ve Fiyatlar</Text>
          {shopData.services.map((service: any, index: number) => (
            <View key={index} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name || 'Hizmet'}</Text>
              </View>
              <Text style={styles.servicePrice}>{service.price ? `₺${service.price}` : 'Fiyat bilgisi yok'}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Book Button */}
      <View style={styles.bookContainer}>
        <TouchableOpacity 
          style={[
            styles.bookButton, 
            !isPaymentActive && styles.bookButtonDisabled
          ]} 
          onPress={() => {
            if (isPaymentActive) {
              router.push({
                pathname: '/booking',
                params: { shopId: id }
              });
            } else {
              Alert.alert(
                'Randevu Alınamaz',
                'Bu mekan için randevu almak şu anda mümkün değildir. İşletme sahibi henüz ödeme yapmamıştır.'
              );
            }
          }}
          disabled={!isPaymentActive}
        >
          <Text style={[
            styles.bookButtonText,
            !isPaymentActive && styles.bookButtonTextDisabled
          ]}>
            Randevu Al
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    minHeight: 70,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 8,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    color: '#dc2626',
    fontSize: 15,
    marginLeft: 4,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fef2f2',
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#E8F4FD',
  },
  mainImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  imageText: {
    marginTop: 10,
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  shopName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  address: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  phone: {
    marginLeft: 8,
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
  },
  instagramContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  instagramText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hours: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  servicesContainer: {
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  descriptionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
  bookButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
    shadowOpacity: 0.2,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bookButtonTextDisabled: {
    color: '#f3f4f6',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  rating: {
    marginLeft: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  ratingCount: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  reviewsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  reviewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  reviewText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  averageRating: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  writeReviewButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  reviewFormContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reviewFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  reviewInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 100,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  submitReviewButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitReviewButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  submitReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyReviewsText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  emptyReviewsSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#94a3b8',
  },
  reviewDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
  googleReviewsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  googleReviewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
});
