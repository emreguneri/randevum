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
  initialized: boolean; // Auth state'inin yüklenip yüklenmediğini gösterir
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
  const [initialized, setInitialized] = useState(false);
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
    console.log("[AuthContext] syncUser called with:", firebaseUser?.uid || "null");
    if (!firebaseUser) {
      console.log("[AuthContext] No firebaseUser, setting user to null");
      setUser(null);
      setLoading(false);
      setInitialized(true);
      persistSession(null);
      return;
    }

    try {
      const roleData = await fetchUserRole(firebaseUser.uid);
      console.log("[AuthContext] Role data fetched:", roleData);

      const appUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: (roleData?.role === "admin" || roleData?.role === "customer" 
          ? roleData.role 
          : null) as AppUser["role"],
        subscriptionStatus: roleData?.subscriptionStatus,
      };

      console.log("[AuthContext] Setting user:", appUser);
      setUser(appUser);
      persistSession(appUser);
    } catch (error) {
      console.error("[AuthContext] Error syncing user:", error);
      // Hata durumunda bile user bilgisini set et (role null olabilir)
      const appUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: null,
        subscriptionStatus: undefined,
      };
      setUser(appUser);
    } finally {
      console.log("[AuthContext] Setting loading=false, initialized=true");
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    console.log("[AuthContext] useEffect - Setting up auth listener");
    
    // Auth state değişikliklerini dinle
    // onAuthStateChanged ilk tetiklendiğinde mevcut kullanıcıyı da döndürür
    let isFirstCall = true;
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[AuthContext] onAuthStateChanged triggered, user:", firebaseUser?.uid || "null", "isFirstCall:", isFirstCall);
      
      // İlk çağrıda mevcut kullanıcıyı sync et
      await syncUser(firebaseUser);
      
      // İlk çağrıdan sonra initialized'ı true yap (syncUser zaten set ediyor ama emin olmak için)
      if (isFirstCall) {
        isFirstCall = false;
        console.log("[AuthContext] First auth state check completed");
      }
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
    () => ({ user, loading, initialized, login, register, logout, refreshProfile }),
    [user, loading, initialized]
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
