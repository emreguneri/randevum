import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        freezeOnBlur: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Randevu Al',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Harita',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoriler',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilim',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
