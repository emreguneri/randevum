import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = await AsyncStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
      setUserId("user-id-from-token");
    }
  }

  async function requestOtp(phone: string) {
    await authApi.requestOtp(phone);
  }

  async function login(phone: string, code: string) {
    const result = await authApi.verifyOtp(phone, code);
    setIsAuthenticated(true);
    setUserId(result.userId);
  }

  async function logout() {
    await authApi.logout();
    setIsAuthenticated(false);
    setUserId(null);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout, requestOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

