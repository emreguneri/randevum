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

    // auth.currentUser'ı da kontrol et (login sonrası state güncellenene kadar)
    const currentUser = auth.currentUser;
    const canAccessTabs = !!user || !!currentUser || guestMode;

    // Sadece giriş yapmamış kullanıcıları login'e yönlendir
    if (!canAccessTabs && inAuthGroup) {
      router.replace('/login');
    } 
    // Guest mode'da olan kullanıcılar login/register sayfalarına gidebilir
    // Bu yüzden guest mode kontrolü ekliyoruz
    else if ((!!user || !!currentUser) && !guestMode && inLoginPage) {
      // Sadece gerçek kullanıcı giriş yapmışsa (guest mode değilse) ve login/register sayfasındaysa tabs'a yönlendir
      router.replace('/(tabs)');
    }
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
