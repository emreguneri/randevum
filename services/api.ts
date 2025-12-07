import axios from 'axios';

// API base URL - gerçek backend URL'i buraya gelecek
const API_BASE_URL = 'https://api.berber-app.com';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekleme
api.interceptors.request.use(
  (config) => {
    // Token varsa header'a ekle
    // const token = AsyncStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token süresi dolmuş, login sayfasına yönlendir
      // AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

// API servisleri
export const shopService = {
  // Tüm dükkanları getir
  getAllShops: () => api.get('/shops'),
  
  // ID'ye göre dükkan getir
  getShopById: (id: string) => api.get(`/shops/${id}`),
  
  // Kategoriye göre dükkanları getir
  getShopsByCategory: (category: string) => api.get(`/shops?category=${category}`),
  
  // Konuma göre yakın dükkanları getir
  getNearbyShops: (latitude: number, longitude: number, radius: number = 5) => 
    api.get(`/shops/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`),
  
  // Dükkan kaydet (admin)
  createShop: (shopData: any) => api.post('/shops', shopData),
  
  // Dükkan güncelle (admin)
  updateShop: (id: string, shopData: any) => api.put(`/shops/${id}`, shopData),
  
  // Dükkan sil (admin)
  deleteShop: (id: string) => api.delete(`/shops/${id}`),
};

export const appointmentService = {
  // Randevu oluştur
  createAppointment: (appointmentData: any) => api.post('/appointments', appointmentData),
  
  // Kullanıcının randevularını getir
  getUserAppointments: (userId: string) => api.get(`/appointments/user/${userId}`),
  
  // Dükkanın randevularını getir (admin)
  getShopAppointments: (shopId: string) => api.get(`/appointments/shop/${shopId}`),
  
  // Randevu güncelle
  updateAppointment: (id: string, appointmentData: any) => api.put(`/appointments/${id}`, appointmentData),
  
  // Randevu iptal et
  cancelAppointment: (id: string) => api.delete(`/appointments/${id}`),
  
  // Müsait saatleri getir
  getAvailableSlots: (shopId: string, date: string) => api.get(`/appointments/available/${shopId}?date=${date}`),
};

export const userService = {
  // Kullanıcı kayıt
  register: (userData: any) => api.post('/auth/register', userData),
  
  // Kullanıcı giriş
  login: (credentials: any) => api.post('/auth/login', credentials),
  
  // Profil güncelle
  updateProfile: (userId: string, userData: any) => api.put(`/users/${userId}`, userData),
  
  // Favorileri getir
  getFavorites: (userId: string) => api.get(`/users/${userId}/favorites`),
  
  // Favori ekle
  addFavorite: (userId: string, shopId: string) => api.post(`/users/${userId}/favorites`, { shopId }),
  
  // Favori çıkar
  removeFavorite: (userId: string, shopId: string) => api.delete(`/users/${userId}/favorites/${shopId}`),
};

export const reviewService = {
  // Yorum oluştur
  createReview: (reviewData: any) => api.post('/reviews', reviewData),
  
  // Dükkanın yorumlarını getir
  getShopReviews: (shopId: string) => api.get(`/reviews/shop/${shopId}`),
  
  // Yorum güncelle
  updateReview: (id: string, reviewData: any) => api.put(`/reviews/${id}`, reviewData),
  
  // Yorum sil
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
};

export default api;
