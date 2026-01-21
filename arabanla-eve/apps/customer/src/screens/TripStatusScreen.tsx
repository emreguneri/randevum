import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { tripsApi } from "../services/api";
import type { TripStatus } from "@arabanla-eve/shared";

interface TripStatusScreenProps {
  tripId: string;
  onBack: () => void;
}

export default function TripStatusScreen({ tripId, onBack }: TripStatusScreenProps) {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
    const interval = setInterval(loadTrip, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [tripId]);

  async function loadTrip() {
    try {
      const data = await tripsApi.getTrip(tripId);
      setTrip(data);
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Trip yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    try {
      await tripsApi.cancelTrip(tripId);
      Alert.alert("Başarılı", "Trip iptal edildi");
      onBack();
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Trip iptal edilemedi");
    }
  }

  if (loading && !trip) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text>Trip bulunamadı</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>Geri</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusLabels: Record<TripStatus, string> = {
    REQUESTED: "İstek Oluşturuldu",
    AUTHORIZED: "Ödeme Onaylandı",
    DRIVER_ASSIGNED: "Sürücü Atandı",
    DRIVER_ARRIVED: "Sürücü Geldi",
    STARTED: "Yolculuk Başladı",
    COMPLETED: "Tamamlandı",
    CANCELED: "İptal Edildi",
  };

  const canCancel = ["REQUESTED", "AUTHORIZED", "DRIVER_ASSIGNED"].includes(trip.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Yolculuk Durumu</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Durum</Text>
          <Text style={styles.statusValue}>{statusLabels[trip.status] || trip.status}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Yolculuk Modu</Text>
          <Text style={styles.infoValue}>{trip.mode === "STANDARD" ? "Standart" : "Yol Üstü"}</Text>
        </View>

        {trip.driverId && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Sürücü</Text>
            <Text style={styles.infoValue}>Sürücü atandı</Text>
          </View>
        )}

        {trip.estimatedDistanceKm && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Tahmini Mesafe</Text>
            <Text style={styles.infoValue}>{trip.estimatedDistanceKm.toFixed(1)} km</Text>
          </View>
        )}

        {trip.estimatedDurationMin && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Tahmini Süre</Text>
            <Text style={styles.infoValue}>{trip.estimatedDurationMin} dakika</Text>
          </View>
        )}

        {trip.fareKurus && (
          <View style={[styles.infoCard, styles.fareCard]}>
            <Text style={styles.infoLabel}>Ücret</Text>
            <Text style={styles.fareValue}>{(trip.fareKurus / 100).toFixed(2)} TRY</Text>
          </View>
        )}

        {trip.status === "COMPLETED" && (
          <View style={[styles.infoCard, styles.successCard]}>
            <Text style={styles.successText}>✅ Yolculuk tamamlandı!</Text>
            {trip.fareKurus && (
              <Text style={styles.successSubtext}>
                Ödeme alındı: {(trip.fareKurus / 100).toFixed(2)} TRY
              </Text>
            )}
          </View>
        )}

        {canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Yolculuğu İptal Et</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
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
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  infoCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fareCard: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  fareValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  successCard: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#2196F3",
    marginTop: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 5,
  },
  successSubtext: {
    fontSize: 14,
    color: "#666",
  },
});

