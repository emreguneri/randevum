import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile, signUp } from '@/services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type UserType = 'customer' | 'business';

export default function RegisterScreen() {
  const { setGuestMode, refreshProfile } = useAuth();
  const [userType, setUserType] = useState<UserType>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      const credential = await signUp(email.trim(), password);
      const createdUser = credential.user;

      if (createdUser) {
        if (name.trim().length > 0) {
          await updateProfile(createdUser, { displayName: name.trim() });
        }

        const role = userType === 'business' ? 'admin' : 'customer';
        const effectiveDisplayName =
          name.trim() ||
          createdUser.displayName ||
          createdUser.email ||
          null;

        await createUserProfile(createdUser.uid, {
          email: createdUser.email ?? email.trim(),
          displayName: effectiveDisplayName,
          role,
          subscriptionStatus: 'inactive',
          subscriptionEndsAt: null,
        });

        // İşletme sahibi seçildiyse ödeme öncesi bilgiyi sakla
        if (role === 'admin') {
          await AsyncStorage.setItem('pendingBusinessOwner', JSON.stringify({
            email: createdUser.email ?? email.trim(),
            name: name.trim() || createdUser.displayName || '',
          }));
        } else {
          await AsyncStorage.removeItem('pendingBusinessOwner');
        }

        // Guest mode'u temizle
        await setGuestMode(false);
        
        // Profile'ı yenile (AuthContext'teki onAuthStateChanged'in tetiklenmesi için bekle)
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshProfile();
      }

      Alert.alert('Başarılı', 'Hesabınız oluşturuldu!', [
        { text: 'Tamam', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      console.error('Register error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Kayıt olurken bir hata oluştu.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu email adresi zaten kullanılıyor. Lütfen giriş yapın.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi. Lütfen geçerli bir email girin.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'İnternet bağlantınızı kontrol edin.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/şifre ile kayıt şu anda aktif değil.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Kayıt Hatası', errorMessage);
    } finally {
      setLoading(false);
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
            onPress={() => {
              // Geri tuşuna basıldığında profilim sekmesine dön ve misafir modunu koru
              router.replace('/(tabs)/profile');
            }}
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kayıt Ol</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <IconSymbol name="person.badge.plus" size={64} color="#dc2626" />
            </View>
            <Text style={styles.welcomeText}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Randevum'a katılın</Text>
          </View>

          <View style={styles.form}>
            {/* Kullanıcı Tipi Seçimi */}
            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeLabel}>Hesap Tipi</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'customer' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setUserType('customer')}
                >
                  <IconSymbol 
                    name="person" 
                    size={20} 
                    color={userType === 'customer' ? '#fff' : '#64748b'} 
                  />
                  <Text style={[
                    styles.userTypeButtonText,
                    userType === 'customer' && styles.userTypeButtonTextActive
                  ]}>
                    Müşteri
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === 'business' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setUserType('business')}
                >
                  <IconSymbol 
                    name="building.2" 
                    size={20} 
                    color={userType === 'business' ? '#fff' : '#64748b'} 
                  />
                  <Text style={[
                    styles.userTypeButtonText,
                    userType === 'business' && styles.userTypeButtonTextActive
                  ]}>
                    İşletme Sahibi
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <IconSymbol name="person" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

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
                placeholder="Şifre (en az 6 karakter)"
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

            <View style={styles.inputContainer}>
              <IconSymbol name="lock.fill" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Şifre tekrar"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <IconSymbol
                  name={showConfirmPassword ? "eye.slash" : "eye"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>
                Zaten hesabınız var mı? <Text style={styles.loginButtonTextBold}>Giriş Yap</Text>
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
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  userTypeButtonActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  businessInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 18,
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
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
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
  loginButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginButtonText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  loginButtonTextBold: {
    color: '#dc2626',
    fontWeight: '700',
  },
});

