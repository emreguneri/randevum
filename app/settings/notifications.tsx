import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsSettings() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    appointmentReminders: true,
    promotions: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      setSettings(newSettings);
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Bildirimler</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="bell.fill" size={20} color="#ef4444" />
              <View style={styles.settingDetails}>
                <Text style={styles.settingName}>Push Bildirimleri</Text>
                <Text style={styles.settingDescription}>Uygulama bildirimlerini al</Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: '#e2e8f0', true: '#ef4444' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="envelope.fill" size={20} color="#ef4444" />
              <View style={styles.settingDetails}>
                <Text style={styles.settingName}>E-posta Bildirimleri</Text>
                <Text style={styles.settingDescription}>E-posta ile bildirim al</Text>
              </View>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
              trackColor={{ false: '#e2e8f0', true: '#ef4444' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="calendar" size={20} color="#ef4444" />
              <View style={styles.settingDetails}>
                <Text style={styles.settingName}>Randevu Hatırlatıcıları</Text>
                <Text style={styles.settingDescription}>Randevu öncesi hatırlatma</Text>
              </View>
            </View>
            <Switch
              value={settings.appointmentReminders}
              onValueChange={() => toggleSetting('appointmentReminders')}
              trackColor={{ false: '#e2e8f0', true: '#ef4444' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <IconSymbol name="megaphone.fill" size={20} color="#ef4444" />
              <View style={styles.settingDetails}>
                <Text style={styles.settingName}>Promosyonlar ve Kampanyalar</Text>
                <Text style={styles.settingDescription}>Özel fırsatlar ve kampanyalar</Text>
              </View>
            </View>
            <Switch
              value={settings.promotions}
              onValueChange={() => toggleSetting('promotions')}
              trackColor={{ false: '#e2e8f0', true: '#ef4444' }}
              thumbColor="#fff"
            />
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingDetails: {
    marginLeft: 12,
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});
