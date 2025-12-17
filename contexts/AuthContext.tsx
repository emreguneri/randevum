import { auth } from '@/config/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '@/services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  guestMode: boolean;
  setGuestMode: (value: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  guestMode: false,
  setGuestMode: async () => {
    /* default empty */
  },
  profile: null,
  refreshProfile: async () => {
    /* default empty */
  },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestModeState] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem('guestMode');
        const hasGuestMode = value === 'true';
        
        // Eğer guest mode kaydedilmemişse ve kullanıcı giriş yapmamışsa, otomatik olarak guest mode'u aktif et
        if (!hasGuestMode) {
          // Firebase auth durumunu kontrol et
          const currentUser = auth.currentUser;
          if (!currentUser) {
            // Kullanıcı giriş yapmamış ve guest mode kaydedilmemişse, otomatik guest mode aktif et
            await AsyncStorage.setItem('guestMode', 'true');
            setGuestModeState(true);
            return;
          }
        }
        
        setGuestModeState(hasGuestMode);
      } catch (error) {
        console.error('Error loading guest mode:', error);
        // Hata durumunda da guest mode'u aktif et (kullanıcı deneyimi için)
        setGuestModeState(true);
      }
    })();
  }, []);

  const loadUserProfile = useCallback(
    async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setProfile(null);
        return;
      }

      try {
        const existingProfile = await getUserProfile(firebaseUser.uid);
        if (existingProfile) {
          setProfile(existingProfile);
          return;
        }

        const defaults = {
          email: firebaseUser.email ?? null,
          displayName: firebaseUser.displayName ?? null,
          role: 'customer' as const,
          subscriptionStatus: 'inactive' as const,
        };

        await createUserProfile(firebaseUser.uid, defaults);
        const createdProfile = await getUserProfile(firebaseUser.uid);
        setProfile(
          createdProfile ?? {
            uid: firebaseUser.uid,
            ...defaults,
            subscriptionEndsAt: null,
            createdAt: null,
            updatedAt: null,
          }
        );
      } catch (error) {
        console.error('[AuthContext] loadUserProfile error:', error);
        setProfile(null);
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      console.log('[AuthContext] onAuthStateChanged triggered, user:', firebaseUser?.uid || 'null');
      
      // Eğer kullanıcı giriş yapmışsa, guest mode'u hemen temizle
      if (firebaseUser) {
        console.log('[AuthContext] User logged in, clearing guest mode');
        await AsyncStorage.removeItem('guestMode');
        setGuestModeState(false);
        setUser(firebaseUser);
        
        // Yeni kullanıcı giriş yaptığında AsyncStorage'daki randevuları temizle
        AsyncStorage.removeItem('appointments').catch(() => {});
        AsyncStorage.removeItem('guestEmail').catch(() => {});
        
        // Profili yükle
        await loadUserProfile(firebaseUser);
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      // Kullanıcı giriş yapmamış
      setUser(null);
      setProfile(null);
      
      // Guest mode kontrolü
      const currentGuestMode = await AsyncStorage.getItem('guestMode');
      if (currentGuestMode !== 'true') {
        // Otomatik guest mode aktif et
        await AsyncStorage.setItem('guestMode', 'true');
        setGuestModeState(true);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadUserProfile]);

  const setGuestMode = async (value: boolean) => {
    try {
      if (value) {
        // Guest mode aktif edildiğinde kullanıcı bilgilerini temizle
        await AsyncStorage.setItem('guestMode', 'true');
        // Guest mode'da user ve profile'ı temizle
        setUser(null);
        setProfile(null);
        // Önceki kullanıcı bilgilerini AsyncStorage'dan temizle
        await AsyncStorage.removeItem('guestInfo');
        await AsyncStorage.removeItem('selectedUserType');
      } else {
        await AsyncStorage.removeItem('guestMode');
      }
    } catch (error) {
      console.error('Error updating guest mode:', error);
    } finally {
      setGuestModeState(value);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user);
    }
  }, [user, loadUserProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, guestMode, setGuestMode, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

