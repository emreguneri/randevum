"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const navigation = [
  { label: "Hakkımızda", href: "#about" },
  { label: "Özellikler", href: "#features" },
  { label: "Entegrasyonlar", href: "#integrations" },
  { label: "Sektörler", href: "#use-cases" },
  { label: "Paketler", href: "#pricing" },
  { label: "Referanslar", href: "#references" },
  { label: "Sık Sorulanlar", href: "#faq" },
  { label: "Bize Ulaşın", href: "#contact" },
];

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Ana sayfa dışındaysak linkleri ana sayfaya yönlendir
  const isHomePage = pathname === "/";
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isHomePage) {
      // Ana sayfada değilsek, önce ana sayfaya yönlendir
      e.preventDefault();
      window.location.href = `/${href}`;
    }
    // Ana sayfadaysak normal hash scroll davranışı devam eder
  };

  const handleLogout = async () => {
    await logout();
  };

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const isAdmin = user?.role === "admin";
  const isCustomer = true; // Her zaman true, çünkü herkes müşteri olabilir

  const cta = useMemo(() => {
    if (loading) return null;
    if (user) {
      return (
        <div className="flex items-center gap-3">
          <div
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen((prev) => !prev);
              }}
              className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-white transition hover:border-white/60 focus:outline-none focus:ring-2"
            >
              Profilim
            </button>
            <div
              ref={dropdownRef}
              className={`absolute right-0 top-full z-[10000] mt-3 w-64 origin-top rounded-2xl border border-white/20 bg-slate-950/98 p-4 text-sm text-slate-100 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-200 ${
                isDropdownOpen
                  ? "visible translate-y-0 opacity-100 scale-100"
                  : "invisible -translate-y-2 opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {/* Müşteri Menüsü - Her zaman görünür */}
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Müşteri
                </div>
                <div className="space-y-1">
                  <Link
                    href="/customer/bookings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2"
                  >
                    <span className="text-base">📅</span>
                    <span>Randevularım</span>
                  </Link>
                  <Link
                    href="/customer/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2"
                  >
                    <span className="text-base">⚙️</span>
                    <span>Hesap Ayarları</span>
                  </Link>
                </div>
              </div>
              
              {/* İşletme Sahibi Menüsü - Sadece admin ise görünür */}
              {isAdmin && (
                <div className="my-3 border-t border-white/10 pt-3">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    İşletme Sahibi
                  </div>
                  <div className="space-y-1">
                    {user.subscriptionStatus !== "active" && (
                      <Link
                        href="/payment"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2" style={{ color: '#8a0a0a' }}
                      >
                        <span className="text-base">💳</span>
                        <span>Ödeme Yap</span>
                      </Link>
                    )}
                    <Link
                      href="/dashboard/shop"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-emerald-300 transition-colors hover:bg-emerald-500/20 hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                    >
                      <span className="text-base">➕</span>
                      <span>Mekan Ekle / Düzenle</span>
                    </Link>
                    <Link
                      href="/dashboard/bookings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2"
                    >
                      <span className="text-base">📋</span>
                      <span>Randevu Yönetimi</span>
                    </Link>
                    <Link
                      href="/dashboard/revenue"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2"
                    >
                      <span className="text-base">📊</span>
                      <span>Gelir & İstatistikler</span>
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="my-2 border-t border-white/10 pt-2">
                <button
                  onClick={async () => {
                    setIsDropdownOpen(false);
                    await handleLogout();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-slate-300 transition-colors hover:bg-slate-700/20 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🚪</span>
                    <span>Çıkış Yap</span>
                  </div>
                  <span className="text-xs text-slate-400/70">⌘⇧Q</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/60"
        >
          Giriş Yap
        </Link>
        <Link
          href="/auth/register"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-200" style={{ boxShadow: '0 10px 15px -3px rgba(45, 10, 10, 0.2)' }}
        >
          Kayıt Ol
        </Link>
      </div>
    );
  }, [loading, logout, user, isAdmin, isDropdownOpen]);

  return (
    <nav className="relative z-[9999] flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-white/10 px-6 py-4 backdrop-blur" style={{ backgroundColor: '#0B0A0A' }}>
      <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg" style={{ background: 'linear-gradient(to bottom right, #2d0a0a, #1a0a0a, #0a0505)' }}>
          Rv
        </span>
        Randevum
      </Link>
      <div className="hidden items-center gap-6 text-sm font-medium text-slate-200 md:flex">
        {navigation.map((item) => (
          <Link 
            key={item.href} 
            href={isHomePage ? item.href : `/${item.href}`}
            onClick={(e) => handleNavClick(e, item.href)}
            className="transition hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
      {cta}
    </nav>
  );
}
