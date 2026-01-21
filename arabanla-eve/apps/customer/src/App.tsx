import { registerRootComponent } from "expo";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./contexts/AuthContext";
import HomeScreen from "./screens/HomeScreen";

function AppContent() {
  // Kullanıcı login olmadan direkt home screen'e girebilir
  // Telefon doğrulaması trip oluştururken istenecek
  return <HomeScreen />;
}

function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <AppContent />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

// Register the app component with Expo
registerRootComponent(App);

