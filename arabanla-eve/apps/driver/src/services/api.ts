import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

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

// Driver API
export const driverApi = {
  async onboard() {
    return apiRequest("/drivers/onboarding", {
      method: "POST",
    });
  },

  async updatePresence(data: { isOnline: boolean; lat?: number; lng?: number }) {
    return apiRequest("/drivers/presence", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getTrips() {
    return apiRequest("/drivers/trips");
  },

  async acceptTrip(tripId: string) {
    return apiRequest(`/drivers/trips/${tripId}/accept`, {
      method: "POST",
    });
  },

  async arrived(tripId: string) {
    return apiRequest(`/drivers/trips/${tripId}/arrived`, {
      method: "POST",
    });
  },

  async startTrip(tripId: string) {
    return apiRequest(`/drivers/trips/${tripId}/start`, {
      method: "POST",
    });
  },

  async completeTrip(tripId: string, data: { actualDistanceKm: number; waitingMinutes: number }) {
    return apiRequest(`/drivers/trips/${tripId}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async noShow(tripId: string, data: { waitingMinutes?: number }) {
    return apiRequest(`/drivers/trips/${tripId}/no-show`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

