import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacySettings() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Gizlilik</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gizlilik Ayarları</Text>
          
          <View style={styles.infoCard}>
            <IconSymbol name="lock.fill" size={24} color="#ef4444" />
            <Text style={styles.infoTitle}>Veri Güvenliği</Text>
            <Text style={styles.infoText}>
              Kişisel bilgileriniz güvenli bir şekilde saklanmaktadır. Tüm veriler yerel cihazınızda şifrelenmiş olarak tutulur.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <IconSymbol name="eye.slash.fill" size={24} color="#ef4444" />
            <Text style={styles.infoTitle}>Veri Paylaşımı</Text>
            <Text style={styles.infoText}>
              Kişisel bilgileriniz üçüncü taraflarla paylaşılmamaktadır. Randevu bilgileriniz yalnızca seçtiğiniz işletme ile paylaşılır.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <IconSymbol name="trash.fill" size={24} color="#ef4444" />
            <Text style={styles.infoTitle}>Veri Silme</Text>
            <Text style={styles.infoText}>
              Hesabınızı sildiğinizde tüm kişisel verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
            </Text>
          </View>

          <View style={styles.actionCard}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Verilerimi İndir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Hesabımı Sil</Text>
            </TouchableOpacity>
          </View>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    fontWeight: '500',
  },
  actionCard: {
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
});
