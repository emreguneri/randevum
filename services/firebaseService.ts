import { auth, db } from '@/config/firebase';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User,
    UserCredential,
} from 'firebase/auth';
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from 'firebase/firestore';

// ============================================
// AUTHENTICATION SERVİSLERİ
// ============================================

/**
 * Email ve şifre ile yeni kullanıcı oluşturur.
 */
export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Email ve şifre ile giriş yapar.
 */
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Oturumu kapatır.
 */
export const logout = async (): Promise<void> => {
  return await signOut(auth);
};

/**
 * Auth durumunu dinler.
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Mevcut kullanıcıyı döner.
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// ============================================
// USER PROFILE SERVİSLERİ
// ============================================

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'customer' | 'admin';
  subscriptionStatus?: 'inactive' | 'active' | 'past_due' | 'cancelled';
  subscriptionEndsAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

const userDoc = (uid: string) => doc(db, 'users', uid);

export const createUserProfile = async (uid: string, data: Omit<UserProfile, 'uid'>) => {
  const timestamp = serverTimestamp();
  await setDoc(
    userDoc(uid),
    {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    { merge: true }
  );
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await updateDoc(userDoc(uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snapshot = await getDoc(userDoc(uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();

  return {
    uid,
    email: (data.email ?? null) as string | null,
    displayName: (data.displayName ?? null) as string | null,
    role: (data.role ?? 'customer') as UserProfile['role'],
    subscriptionStatus: data.subscriptionStatus,
    subscriptionEndsAt: data.subscriptionEndsAt?.toDate
      ? data.subscriptionEndsAt.toDate()
      : null,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
  };
};

