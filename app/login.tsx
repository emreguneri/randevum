import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { signIn } from '@/services/firebaseService';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { setGuestMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen email ve şifre giriniz.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Giriş yapıldığında guest mode'u temizle
      await setGuestMode(false);
      
      // onAuthStateChanged'in tetiklenmesi için kısa bir bekleme
      // Bu sayede _layout.tsx'teki user state'i güncellenir
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Giriş yapılırken bir hata oluştu.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Şifre yanlış.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
      }
      
      Alert.alert('Giriş Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    try {
      // Guest mode'u kaydet
      await setGuestMode(true);
      // _layout.tsx'teki useEffect segments değiştiğinde guest mode kontrolü yapacak
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error setting guest mode:', error);
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giriş Yap</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <IconSymbol name="person.circle.fill" size={64} color="#dc2626" />
            </View>
            <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
            <Text style={styles.subtitle}>Randevum hesabınıza giriş yapın</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <IconSymbol name="envelope" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email adresiniz"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="lock" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifreniz"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <IconSymbol
                  name={showPassword ? "eye.slash" : "eye"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleContinueAsGuest}
            >
              <IconSymbol name="person.circle" size={20} color="#64748b" />
              <Text style={styles.guestButtonText}>Üye Olmadan Devam Et</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.registerButtonText}>
                Hesabınız yok mu? <Text style={styles.registerButtonTextBold}>Kayıt Ol</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#dc2626',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guestButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  registerButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  registerButtonText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  registerButtonTextBold: {
    color: '#dc2626',
    fontWeight: '700',
  },
});

