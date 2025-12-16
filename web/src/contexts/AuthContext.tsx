"use client";

import { auth, db } from "@/lib/firebase";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "admin" | "customer" | null;
  subscriptionStatus?: "active" | "inactive" | "expired";
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    displayName: string;
    role: "admin" | "customer";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchUserRole(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) return null;
  return userDoc.data();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const persistSession = (appUser: AppUser | null) => {
    const maxAge = 60 * 60 * 24 * 7;
    if (typeof document !== "undefined") {
      if (appUser?.role) {
        document.cookie = `randevum_role=${appUser.role}; path=/; max-age=${maxAge}; sameSite=lax`;
      } else {
        document.cookie = "randevum_role=; path=/; max-age=0; sameSite=lax";
      }
    }
  };

  const syncUser = async (firebaseUser: User | null) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      persistSession(null);
      return;
    }

    const roleData = await fetchUserRole(firebaseUser.uid);

    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: (roleData?.role as AppUser["role"]) ?? null,
      subscriptionStatus: roleData?.subscriptionStatus,
    });
    setLoading(false);
    persistSession({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: (roleData?.role as AppUser["role"]) ?? null,
      subscriptionStatus: roleData?.subscriptionStatus,
    });
  };

  useEffect(() => {
    // İlk yüklemede mevcut kullanıcıyı kontrol et
    const currentUser = auth.currentUser;
    if (currentUser) {
      syncUser(currentUser);
    } else {
      setLoading(false);
    }

    // Auth state değişikliklerini dinle
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      syncUser(firebaseUser);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
    await syncUser(auth.currentUser);
  };

  const register = async ({
    email,
    password,
    displayName,
    role,
  }: {
    email: string;
    password: string;
    displayName: string;
    role: "admin" | "customer";
  }) => {
    setLoading(true);
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    if (credentials.user) {
      if (displayName) {
        await updateProfile(credentials.user, { displayName });
      }
      const userPayload: Record<string, any> = {
        uid: credentials.user.uid,
        email,
        displayName,
        role,
        createdAt: serverTimestamp(),
      };

      if (role === "admin") {
        userPayload.subscriptionStatus = "inactive";
      }

      await setDoc(doc(db, "users", credentials.user.uid), userPayload);
      await syncUser(credentials.user);
      router.push("/");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    persistSession(null);
    router.push("/");
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    await syncUser(auth.currentUser);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refreshProfile }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
