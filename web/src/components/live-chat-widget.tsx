"use client";

import { useEffect, useState } from "react";

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Chat widget'ı sadece client-side'da render et
  useEffect(() => {
    // Tawk.to veya başka bir live chat servisi entegrasyonu buraya eklenebilir
    // Şimdilik placeholder olarak basit bir widget yapıyoruz
  }, []);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-900 to-slate-900 shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Canlı destek"
      >
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
          1
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9998] w-80">
      {isOpen ? (
        <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-amber-900/30 to-slate-900/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-900 to-slate-900">
                <span className="text-lg">💬</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Canlı Destek</h3>
                <p className="text-xs text-slate-300">Genellikle 1 dakika içinde yanıt veririz</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <button
                onClick={() => setIsMinimized(true)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Küçült"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Kapat"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {/* Welcome Message */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-900/30 to-slate-900/30">
                <span className="text-sm">🤖</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-2.5">
                  <p className="text-sm text-slate-200">
                    Merhaba! 👋 Randevum hakkında sorularınız mı var? Size nasıl yardımcı olabilirim?
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Fiyatlandırma", "Özellikler", "Demo İste", "Destek"].map((quickAction) => (
                    <button
                      key={quickAction}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-amber-700/50 hover:bg-amber-900/20 hover:text-white"
                    >
                      {quickAction}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Mesajınızı yazın..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700/40"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    // Mesaj gönderme işlemi buraya eklenecek
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-900 to-slate-900 text-white transition hover:opacity-90"
                aria-label="Gönder"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Ortalama yanıt süresi: <span className="font-semibold text-emerald-400">1 dakika</span>
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 rounded-full bg-gradient-to-br from-amber-900 to-slate-900 px-5 py-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          aria-label="Canlı destek"
        >
          <div className="relative">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
              1
            </span>
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-white">Canlı Destek</p>
            <p className="text-xs text-slate-300">Sorularınız için buradayız</p>
          </div>
        </button>
      )}
    </div>
  );
}

