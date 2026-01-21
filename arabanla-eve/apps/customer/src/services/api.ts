import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TripMode, TimeMode } from "@arabanla-eve/shared";

// iOS Simulator için 127.0.0.1 kullanmalıyız (localhost çalışmıyor)
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000";

async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem("auth_token");
}

async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem("auth_token", token);
}

async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem("auth_token");
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  async requestOtp(phone: string) {
    return apiRequest<{ success: boolean; message: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  },

  async verifyOtp(phone: string, code: string) {
    const result = await apiRequest<{ token: string; userId: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
    await setAuthToken(result.token);
    return result;
  },

  async logout() {
    await clearAuthToken();
  },
};

// Trips API
export const tripsApi = {
  async createTrip(data: {
    mode: TripMode;
    timeMode: TimeMode;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    estimatedDistanceKm?: number;
    estimatedDurationMin?: number;
    scheduledAt?: string;
    paymentMethodId: string;
  }) {
    return apiRequest("/trips", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getTrip(tripId: string) {
    return apiRequest(`/trips/${tripId}`);
  },

  async getUserTrips() {
    return apiRequest("/trips");
  },

  async cancelTrip(tripId: string) {
    return apiRequest(`/trips/${tripId}/cancel`, {
      method: "POST",
    });
  },
};

export async function healthcheck() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}
