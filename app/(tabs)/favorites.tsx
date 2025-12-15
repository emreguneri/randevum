import { AnimatedTabScreen } from '@/components/animated-tab-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const { guestMode } = useAuth();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [guestMode])
  );

  const loadFavorites = async () => {
    try {
      // Misafir kullanıcı için favorileri yükleme ve temizleme
      if (guestMode) {
        // Misafir kullanıcı için favorileri temizle
        await AsyncStorage.removeItem('favorites');
        setFavorites([]);
        return;
      }

      const favoritesData = await AsyncStorage.getItem('favorites');
      const allShopsData = await AsyncStorage.getItem('allShops');
      const allShops = allShopsData ? JSON.parse(allShopsData) : [];

      if (favoritesData) {
        const parsed = JSON.parse(favoritesData);
        const merged = parsed.map((favorite: any) => {
          const matchedShop = allShops.find((shop: any) => {
            if (favorite.placeId && shop.placeId) {
              return shop.placeId === favorite.placeId;
            }
            return shop.name === favorite.name;
          });

          if (matchedShop) {
            return {
              ...matchedShop,
              ...favorite,
              isPaymentActive:
                matchedShop.isPaymentActive ?? favorite.isPaymentActive ?? false,
            };
          }

          return {
            ...favorite,
            isPaymentActive: favorite.isPaymentActive ?? false,
          };
        });

        setFavorites(merged);
        await AsyncStorage.setItem('favorites', JSON.stringify(merged));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const removeFavorite = (name: string) => {
    Alert.alert(
      'Favorilerden Çıkar',
      'Bu dükkanı favorilerinizden çıkarmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = favorites.filter(fav => fav.name !== name);
              setFavorites(updated);
              await AsyncStorage.setItem('favorites', JSON.stringify(updated));
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Hata', 'Favoriden çıkarırken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const getCategoryIcon = (name: string) => {
    const nameLower = name?.toLowerCase() || '';
    if (nameLower.includes('berber') || nameLower.includes('berber')) {
      return 'scissors';
    } else if (nameLower.includes('güzellik') || nameLower.includes('salon')) {
      return 'sparkles';
    } else if (nameLower.includes('manikür')) {
      return 'hand.raised';
    }
    return 'star';
  };

  const getCategoryColor = (name: string) => {
    const nameLower = name?.toLowerCase() || '';
    if (nameLower.includes('berber')) {
      return '#dc2626';
    } else if (nameLower.includes('güzellik') || nameLower.includes('salon')) {
      return '#FF6B6B';
    } else if (nameLower.includes('manikür')) {
      return '#4ECDC4';
    }
    return '#666';
  };

  return (
    <AnimatedTabScreen>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorilerim</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="heart" size={60} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Henüz favori dükkanınız yok</Text>
          <Text style={styles.emptySubtitle}>
            Beğendiğiniz dükkanları favorilerinize ekleyerek kolayca erişebilirsiniz
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text style={styles.exploreButtonText}>Dükkanları Keşfet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.favoritesList}>
          {favorites.map((favorite, index) => (
            <View key={favorite.id || index} style={styles.favoriteCard}>
              <View style={styles.cardHeader}>
                <View style={styles.shopInfo}>
                  <View style={styles.shopIcon}>
                    <IconSymbol 
                      name={getCategoryIcon(favorite.name)} 
                      size={24} 
                      color={getCategoryColor(favorite.name)} 
                    />
                  </View>
                  <View style={styles.shopDetails}>
                    <Text style={styles.shopName}>{favorite.name}</Text>
                    {favorite.address && (
                      <Text style={styles.shopAddress}>{favorite.address}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeFavorite(favorite.name)}
                >
                  <IconSymbol name="heart.fill" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.cardFooter}>
                {favorite.workingHours && (
                  <View style={styles.contactInfo}>
                    <View style={styles.contactItem}>
                      <IconSymbol name="clock" size={14} color="#666" />
                      <Text style={styles.contactText}>{favorite.workingHours}</Text>
                    </View>
                  </View>
                )}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      // Öncelik sırası: slug > id > placeId > name
                      const shopId = favorite.slug || favorite.id || favorite.placeId || favorite.name;
                      if (!shopId) {
                        Alert.alert('Hata', 'Bu dükkanın bilgileri bulunamadı.');
                        return;
                      }
                      router.push({
                        pathname: '/shop/[id]',
                        params: { id: shopId },
                      });
                    }}
                  >
                    <Text style={styles.actionButtonText}>Detay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton,
                      styles.bookButton,
                      !favorite.isPaymentActive && styles.actionButtonDisabled,
                    ]}
                    onPress={() => {
                      if (!favorite.isPaymentActive) {
                        Alert.alert(
                          'Abonelik Gerekli',
                          'Bu işletme abonelik satın almadığı için uygulama üzerinden randevu alınamaz.'
                        );
                        return;
                      }

                      // Öncelik sırası: slug > id > placeId > name
                      const shopId = favorite.slug || favorite.id || favorite.placeId || favorite.name;
                      if (!shopId) {
                        Alert.alert('Hata', 'Bu dükkanın bilgileri bulunamadı.');
                        return;
                      }
                      router.push({
                        pathname: '/booking',
                        params: { shopId },
                      });
                    }}
                    disabled={!favorite.isPaymentActive}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        styles.bookButtonText,
                        !favorite.isPaymentActive && styles.bookButtonTextDisabled,
                      ]}
                    >
                      Randevu Al
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
  title: {
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
    backgroundColor: '#dc2626',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  favoritesList: {
    padding: 20,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  shopInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  shopIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  shopAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  contactInfo: {
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonDisabled: {
    backgroundColor: '#e2e8f0',
    borderColor: '#e2e8f0',
  },
  bookButton: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bookButtonText: {
    color: '#fff',
  },
  bookButtonTextDisabled: {
    color: '#64748b',
  },
});
