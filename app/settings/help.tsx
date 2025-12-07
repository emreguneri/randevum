import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Help() {
  const faqs = [
    {
      question: 'Randevu nasıl alabilirim?',
      answer: 'Ana sayfadan bir dükkan seçin, "Randevu Al" butonuna tıklayın ve istediğiniz tarih, saat ve hizmeti seçin.',
    },
    {
      question: 'Randevumu nasıl iptal edebilirim?',
      answer: 'Profil sayfasındaki "Aktif Randevularım" bölümünden randevunuzu görüntüleyip "İptal Et" butonuna tıklayabilirsiniz.',
    },
    {
      question: 'Favori dükkan nasıl eklerim?',
      answer: 'Dükkan detay sayfasında kalp ikonuna tıklayarak dükkanı favorilerinize ekleyebilirsiniz.',
    },
    {
      question: 'İşletme sahibi olarak dükkanımı nasıl eklerim?',
      answer: 'Profil sayfasında "İşletme Sahibi" moduna geçip "Mekan Ekle" butonuna tıklayarak dükkan bilgilerinizi girebilirsiniz.',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Yardım</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <IconSymbol name="questionmark.circle.fill" size={20} color="#ef4444" />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <IconSymbol name="envelope.fill" size={20} color="#ef4444" />
              <Text style={styles.contactText}>destek@randevum.com</Text>
            </View>
            <View style={styles.contactItem}>
              <IconSymbol name="phone.fill" size={20} color="#ef4444" />
              <Text style={styles.contactText}>0850 123 45 67</Text>
            </View>
            <View style={styles.contactItem}>
              <IconSymbol name="clock.fill" size={20} color="#ef4444" />
              <Text style={styles.contactText}>Pazartesi - Cuma: 09:00 - 18:00</Text>
            </View>
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
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  faqCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginTop: 8,
    paddingLeft: 28,
    fontWeight: '500',
  },
  contactCard: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contactText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
  },
});
