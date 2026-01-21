import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { driverApi } from "../services/api";
import type { TripStatus } from "@arabanla-eve/shared";

export default function HomeScreen() {
  const { logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState<any>(null);

  useEffect(() => {
    loadTrips();
    const interval = setInterval(loadTrips, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadTrips() {
    try {
      const trips = await driverApi.getTrips();
      const active = trips.find((t: any) =>
        ["DRIVER_ASSIGNED", "DRIVER_ARRIVED", "STARTED"].includes(t.status),
      );
      setActiveTrip(active || null);
    } catch (error) {
      // Silent fail
    }
  }

  async function handleToggleOnline(value: boolean) {
    setLoading(true);
    try {
      // Mock location (Istanbul)
      await driverApi.updatePresence({
        isOnline: value,
        lat: 41.0082,
        lng: 28.9784,
      });
      setIsOnline(value);
      if (value) {
        await driverApi.onboard();
      }
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Durum güncellenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string) {
    if (!activeTrip) return;

    setLoading(true);
    try {
      switch (action) {
        case "arrived":
          await driverApi.arrived(activeTrip.id);
          break;
        case "start":
          await driverApi.startTrip(activeTrip.id);
          break;
        case "complete":
          await driverApi.completeTrip(activeTrip.id, {
            actualDistanceKm: activeTrip.estimatedDistanceKm || 12.5,
            waitingMinutes: 0,
          });
          Alert.alert("Başarılı", "Trip tamamlandı");
          setActiveTrip(null);
          break;
      }
      await loadTrips();
    } catch (error: any) {
      Alert.alert("Hata", error.message || "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  }

  const statusLabels: Record<TripStatus, string> = {
    REQUESTED: "İstek",
    AUTHORIZED: "Onaylandı",
    DRIVER_ASSIGNED: "Atandı",
    DRIVER_ARRIVED: "Geldim",
    STARTED: "Başladı",
    COMPLETED: "Tamamlandı",
    CANCELED: "İptal",
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sürücü Paneli</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Çevrimiçi Durumu</Text>
          <View style={styles.switchContainer}>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              disabled={loading}
            />
            <Text style={styles.switchLabel}>
              {isOnline ? "Çevrimiçi" : "Çevrimdışı"}
            </Text>
          </View>
        </View>

        {activeTrip ? (
          <View style={styles.tripCard}>
            <Text style={styles.tripTitle}>Aktif Trip</Text>
            <Text style={styles.tripStatus}>
              Durum: {statusLabels[activeTrip.status as TripStatus] || activeTrip.status}
            </Text>
            <Text style={styles.tripInfo}>
              Trip ID: {activeTrip.id.substring(0, 8)}...
            </Text>

            {activeTrip.status === "DRIVER_ASSIGNED" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.arrivedButton]}
                onPress={() => handleAction("arrived")}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Geldim</Text>
                )}
              </TouchableOpacity>
            )}

            {activeTrip.status === "DRIVER_ARRIVED" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleAction("start")}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Yolculuğu Başlat</Text>
                )}
              </TouchableOpacity>
            )}

            {activeTrip.status === "STARTED" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleAction("complete")}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>Tamamla</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.noTripCard}>
            <Text style={styles.noTripText}>
              {isOnline ? "Aktif trip bekleniyor..." : "Çevrimiçi olun"}
            </Text>
          </View>
        )}
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
  statusCard: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    marginLeft: 10,
    fontSize: 16,
  },
  tripCard: {
    backgroundColor: "#E3F2FD",
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tripStatus: {
    fontSize: 16,
    marginBottom: 5,
  },
  tripInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  arrivedButton: {
    backgroundColor: "#FF9800",
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  completeButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noTripCard: {
    backgroundColor: "#f9f9f9",
    padding: 40,
    borderRadius: 8,
    alignItems: "center",
  },
  noTripText: {
    fontSize: 16,
    color: "#999",
  },
});

