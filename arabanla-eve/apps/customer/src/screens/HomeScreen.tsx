import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { tripsApi } from "../services/api";
import type { TripMode, TimeMode } from "@arabanla-eve/shared";
import TripStatusScreen from "./TripStatusScreen";

export default function HomeScreen() {
  const { isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<TripMode>("STANDARD");
  const [timeMode, setTimeMode] = useState<TimeMode>("NOW");
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const handleRequestTrip = async () => {
    setLoading(true);
    try {
      // Mock coordinates for Istanbul (Taksim to Kadıköy)
      const trip = await tripsApi.createTrip({
        mode,
        timeMode,
        pickupLat: 41.0369,
        pickupLng: 28.9850,
        dropoffLat: 40.9818,
        dropoffLng: 29.0218,
        estimatedDistanceKm: 12.5,
        estimatedDurationMin: 25,
        paymentMethodId: "mock-payment-method-1",
      });

      // Trip oluşturuldu, status screen'e git
      setActiveTripId(trip.id);
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Trip oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  // Eğer aktif trip varsa, Trip Status Screen göster
  if (activeTripId) {
    return (
      <TripStatusScreen
        tripId={activeTripId}
        onBack={() => setActiveTripId(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Arabanla Eve</Text>
        {isAuthenticated && (
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        )}
      </View>


      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Yol Modu</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.modeButton, mode === "STANDARD" && styles.modeButtonActive]}
            onPress={() => setMode("STANDARD")}
          >
            <Text style={[styles.modeButtonText, mode === "STANDARD" && styles.modeButtonTextActive]}>
              STANDARD
            </Text>
            <Text style={styles.modeButtonSubtext}>En hızlı yol</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === "ROUTE" && styles.modeButtonActive]}
            onPress={() => setMode("ROUTE")}
          >
            <Text style={[styles.modeButtonText, mode === "ROUTE" && styles.modeButtonTextActive]}>
              ROUTE
            </Text>
            <Text style={styles.modeButtonSubtext}>Yol üstü (daha ucuz)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Zaman Modu</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.modeButton, timeMode === "NOW" && styles.modeButtonActive]}
            onPress={() => setTimeMode("NOW")}
          >
            <Text style={[styles.modeButtonText, timeMode === "NOW" && styles.modeButtonTextActive]}>
              ŞİMDİ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, timeMode === "SCHEDULED" && styles.modeButtonActive]}
            onPress={() => setTimeMode("SCHEDULED")}
          >
            <Text style={[styles.modeButtonText, timeMode === "SCHEDULED" && styles.modeButtonTextActive]}>
              PLANLA
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.requestButton, loading && styles.requestButtonDisabled]}
          onPress={handleRequestTrip}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.requestButtonText}>Yolculuk İste</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoutText: {
    color: "#007AFF",
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    marginTop: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  modeButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modeButtonTextActive: {
    color: "#007AFF",
  },
  modeButtonSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  requestButton: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

