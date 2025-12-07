import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminReviews() {
  const [shopName, setShopName] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadShopName();
      loadReviews();
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

  const loadReviews = async () => {
    try {
      // Şimdilik mock data, gerçek uygulamada reviews AsyncStorage'dan veya API'den gelecek
      // Gelecekte randevulardan sonra değerlendirme eklenebilir
      setReviews([]);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <IconSymbol
        key={index}
        name={index < rating ? "star.fill" : "star"}
        size={16}
        color={index < rating ? "#fbbf24" : "#d1d5db"}
      />
    ));
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
        <Text style={styles.title}>Değerlendirmeler</Text>
        <View style={styles.headerSpacer} />
      </View>

      {!shopName ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="exclamationmark.triangle" size={60} color="#f59e0b" />
          <Text style={styles.emptyTitle}>Dükkan bilgisi bulunamadı</Text>
          <Text style={styles.emptySubtitle}>
            Değerlendirmeleri görmek için önce dükkan bilgilerinizi ekleyin
          </Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="star" size={60} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Henüz değerlendirme yok</Text>
          <Text style={styles.emptySubtitle}>
            Müşterileriniz dükkanınız hakkında henüz değerlendirme yapmamış
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Ortalama Puan */}
          <View style={styles.averageRatingCard}>
            <View style={styles.averageRatingInfo}>
              <Text style={styles.averageRatingNumber}>
                {reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0}
              </Text>
              <View style={styles.starsContainer}>
                {renderStars(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0))}
              </View>
              <Text style={styles.reviewCount}>{reviews.length} değerlendirme</Text>
            </View>
          </View>

          {/* Değerlendirmeler Listesi */}
          <View style={styles.reviewsList}>
            {reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.avatar}>
                      <IconSymbol name="person.fill" size={20} color="#ef4444" />
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{review.customerName || 'Müşteri'}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>
                  <View style={styles.starsContainer}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))}
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
  averageRatingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  averageRatingInfo: {
    alignItems: 'center',
  },
  averageRatingNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginTop: 8,
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
});
