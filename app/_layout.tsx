import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { auth } from '@/config/firebase';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { user, loading, guestMode } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentSegment = segments[0];

    const inAuthGroup = currentSegment === '(tabs)';
    const inLoginPage = currentSegment === 'login' || currentSegment === 'register';
    const isInitialLoad = !currentSegment || currentSegment === 'index';

    // auth.currentUser'ı da kontrol et (login sonrası state güncellenene kadar)
    const currentUser = auth.currentUser;
    
    // Guest mode'da olan kullanıcılar tabs'a erişebilir ama login/register sayfalarına da gidebilir
    // Bu yüzden guest mode kontrolünü ayrı tutuyoruz
    const hasAuthenticatedUser = !!user || !!currentUser;
    
    // İlk açılışta guest mode'da olan kullanıcıları direkt tabs'a yönlendir
    if (guestMode && isInitialLoad) {
      router.replace('/(tabs)');
      return;
    }
    
    // Sadece giriş yapmamış ve guest mode'da olmayan kullanıcıları login'e yönlendir
    // Guest mode'da olan kullanıcılar tabs'a erişebilir, bu yüzden onları login'e yönlendirme
    if (!hasAuthenticatedUser && !guestMode && inAuthGroup) {
      router.replace('/login');
      return;
    } 
    
    // Eğer gerçek kullanıcı giriş yapmışsa (guest mode değilse) ve login/register sayfasındaysa tabs'a yönlendir
    // Guest mode'da olan kullanıcılar login/register sayfalarında kalabilir, bu yüzden guest mode kontrolü yapıyoruz
    if (hasAuthenticatedUser && !guestMode && inLoginPage) {
      router.replace('/(tabs)');
      return;
    }
    
    // Guest mode'da olan kullanıcılar login/register sayfalarında kalabilir, yönlendirme yapma
    // Guest mode'da olan kullanıcılar tabs'a erişebilir, yönlendirme yapma
  }, [user, guestMode, loading, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
