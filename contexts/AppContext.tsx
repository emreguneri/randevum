import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useReducer } from 'react';

// Types
interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  category: string;
  rating: number;
  reviewCount: number;
  workingHours: string;
  services: Service[];
  images: string[];
  description: string;
  latitude?: number;
  longitude?: number;
}

interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
}

interface Appointment {
  id: string;
  shopId: string;
  userId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  favorites: string[];
}

interface AppState {
  user: User | null;
  shops: Shop[];
  favorites: Shop[];
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SHOPS'; payload: Shop[] }
  | { type: 'ADD_FAVORITE'; payload: Shop }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'SET_FAVORITES'; payload: Shop[] }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: Appointment }
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] };

// Initial state
const initialState: AppState = {
  user: null,
  shops: [],
  favorites: [],
  appointments: [],
  isLoading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_SHOPS':
      return { ...state, shops: action.payload };
    case 'ADD_FAVORITE':
      return { ...state, favorites: [...state.favorites, action.payload] };
    case 'REMOVE_FAVORITE':
      return { ...state, favorites: state.favorites.filter(shop => shop.id !== action.payload) };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt => 
          apt.id === action.payload.id ? action.payload : apt
        ),
      };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Actions
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  loadShops: () => Promise<void>;
  addToFavorites: (shop: Shop) => Promise<void>;
  removeFromFavorites: (shopId: string) => Promise<void>;
  createAppointment: (appointmentData: Omit<Appointment, 'id'>) => Promise<void>;
  loadAppointments: () => Promise<void>;
} | null>(null);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const login = async (userData: User) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      dispatch({ type: 'SET_USER', payload: userData });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Giriş yapılırken hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Çıkış yapılırken hata oluştu' });
    }
  };

  const loadShops = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call will be implemented here
      // const response = await shopService.getAllShops();
      // dispatch({ type: 'SET_SHOPS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Dükkanlar yüklenirken hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToFavorites = async (shop: Shop) => {
    try {
      dispatch({ type: 'ADD_FAVORITE', payload: shop });
      // API call will be implemented here
      // await userService.addFavorite(state.user!.id, shop.id);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Favori eklenirken hata oluştu' });
    }
  };

  const removeFromFavorites = async (shopId: string) => {
    try {
      dispatch({ type: 'REMOVE_FAVORITE', payload: shopId });
      // API call will be implemented here
      // await userService.removeFavorite(state.user!.id, shopId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Favori çıkarılırken hata oluştu' });
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call will be implemented here
      // const response = await appointmentService.createAppointment(appointmentData);
      // dispatch({ type: 'ADD_APPOINTMENT', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Randevu oluşturulurken hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadAppointments = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // API call will be implemented here
      // const response = await appointmentService.getUserAppointments(state.user!.id);
      // dispatch({ type: 'SET_APPOINTMENTS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Randevular yüklenirken hata oluştu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        loadShops,
        addToFavorites,
        removeFromFavorites,
        createAppointment,
        loadAppointments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
