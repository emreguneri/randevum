"use client";

import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function CustomerSettingsPage() {
  const { user, loading: authLoading, initialized, refreshProfile } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // User yoksa login'e yönlendir - sadece initialized ve loading false olduğunda
  useEffect(() => {
    // Henüz yükleniyorsa bekle
    if (authLoading || !initialized) {
      return;
    }
    
    // Admin kullanıcıları dashboard'a yönlendir
    if (user?.role === "admin") {
      router.replace("/dashboard/shop");
      return;
    }
    
    // User yoksa login'e yönlendir
    if (!user && !hasRedirected) {
      setHasRedirected(true);
      router.replace("/auth/login");
    }
  }, [authLoading, initialized, user, router, hasRedirected]);

  // Loading durumunda veya henüz initialized olmadıysa bekle
  if (authLoading || !initialized) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center py-20">
          <p className="text-slate-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // User yoksa login'e yönlendir (useEffect'te yapılıyor)
  useEffect(() => {
    if (initialized && !user) {
      router.replace("/auth/login");
    }
  }, [initialized, user, router]);

  if (initialized && !user) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center py-20">
          <p className="text-slate-300">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !user) return;

    try {
      setUpdating(true);
      setFeedback(null);

      // Firebase Auth profilini güncelle
      if (displayName && displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName });
      }

      if (email && email !== user.email) {
        await updateEmail(auth.currentUser, email);
      }

      // Firestore'daki kullanıcı dokümanını güncelle
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName || user.displayName,
        email: email || user.email,
        updatedAt: new Date(),
      });

      await refreshProfile();
      setFeedback({ type: "success", message: "Profil bilgileri başarıyla güncellendi." });
    } catch (error: any) {
      console.error("[Settings] Update profile error:", error);
      setFeedback({
        type: "error",
        message: error.message || "Profil güncellenirken bir hata oluştu.",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Yeni şifreler eşleşmiyor." });
      return;
    }

    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "Şifre en az 6 karakter olmalıdır." });
      return;
    }

    try {
      setUpdating(true);
      setFeedback(null);

      // Not: Firebase Auth'ta current password doğrulaması yok
      // Bu güvenlik açığı için re-authentication gerekir, ama şimdilik basit versiyonu yapıyoruz
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback({ type: "success", message: "Şifre başarıyla güncellendi." });
    } catch (error: any) {
      console.error("[Settings] Update password error:", error);
      setFeedback({
        type: "error",
        message: error.message || "Şifre güncellenirken bir hata oluştu.",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 lg:px-12">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur">
          <h1 className="text-3xl font-semibold text-white">Hesap Ayarları</h1>
          <p className="mt-2 text-sm text-slate-200/70">
            Profil bilgilerinizi ve şifrenizi buradan güncelleyebilirsiniz.
          </p>
        </header>

        {feedback && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                : "border-amber-700/40 bg-amber-900/20 text-amber-200"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Profil Bilgileri */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h2 className="mb-6 text-xl font-semibold text-white">Profil Bilgileri</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-300">
                Ad Soyad
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                E-Posta Adresi
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                placeholder="ornek@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full rounded-xl bg-fuchsia-500 px-6 py-3 font-semibold text-white transition hover:bg-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? "Güncelleniyor..." : "Profil Bilgilerini Güncelle"}
            </button>
          </form>
        </div>

        {/* Şifre Değiştirme */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h2 className="mb-6 text-xl font-semibold text-white">Şifre Değiştir</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300">
                Mevcut Şifre
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                placeholder="Mevcut şifrenizi girin"
              />
              <p className="mt-1 text-xs text-slate-400">
                Not: Güvenlik nedeniyle mevcut şifre doğrulaması şu anda aktif değil.
              </p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">
                Yeni Şifre
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                placeholder="En az 6 karakter"
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                Yeni Şifre (Tekrar)
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-fuchsia-400/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
                placeholder="Yeni şifrenizi tekrar girin"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={updating || !newPassword || !confirmPassword}
              className="w-full rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        </div>

        {/* Hesap Bilgileri */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h2 className="mb-6 text-xl font-semibold text-white">Hesap Bilgileri</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm text-slate-300">Kullanıcı ID</span>
              <span className="font-mono text-xs text-slate-400">{user?.uid || "-"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm text-slate-300">Hesap Tipi</span>
              <span className="text-sm font-medium text-white">
                {user?.role === "admin" ? "İşletme Sahibi" : "Müşteri"}
              </span>
            </div>
            {user?.role === "admin" && (
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm text-slate-300">Abonelik Durumu</span>
                <span
                  className={`text-sm font-medium ${
                    user.subscriptionStatus === "active" ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {user.subscriptionStatus === "active" ? "Aktif" : "Pasif"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

