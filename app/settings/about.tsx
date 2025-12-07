import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function About() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Hakkında</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <IconSymbol name="scissors" size={48} color="#ef4444" />
          </View>
          <Text style={styles.appName}>Randevum</Text>
          <Text style={styles.appVersion}>Versiyon 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama Hakkında</Text>
          <Text style={styles.description}>
            Randevum, berber ve güzellik salonlarından kolayca randevu almanızı sağlayan modern bir uygulamadır.
          </Text>
          <Text style={styles.description}>
            İşletme sahipleri dükkanlarını kaydedip randevularını yönetebilir, müşteriler ise favori dükkanlarını bulup hızlıca randevu alabilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özellikler</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
              <Text style={styles.featureText}>Kolay randevu alma</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
              <Text style={styles.featureText}>Favori dükkanlar</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
              <Text style={styles.featureText}>Harita üzerinden dükkan arama</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
              <Text style={styles.featureText}>İşletme yönetim paneli</Text>
            </View>
            <View style={styles.featureItem}>
              <IconSymbol name="checkmark.circle.fill" size={20} color="#10b981" />
              <Text style={styles.featureText}>Randevu takibi</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>E-posta:</Text>
            <Text style={styles.contactValue}>info@randevum.com</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Web:</Text>
            <Text style={styles.contactValue}>www.randevum.com</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Randevum. Tüm hakları saklıdır.</Text>
        </View>
      </View>
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
    justifyContent: 'space-between',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 32,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  appVersion: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '500',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
  },
  contactInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    width: 80,
  },
  contactValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
