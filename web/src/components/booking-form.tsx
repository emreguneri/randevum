"use client";

import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";

const initialForm = {
  name: "",
  phone: "",
  service: "",
  branch: "Merkez",
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

const services = [
  "Saç Kesimi",
  "Saç Boyama",
  "Cilt Bakımı",
  "Manikür & Pedikür",
  "Saç Bakımı",
];

const branches = ["Merkez", "Balıkesir - Karesi", "Balıkesir - Altıeylül"];

export function BookingForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null);
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    if (!form.name || !form.phone || !form.service || !form.preferredDate || !form.preferredTime) {
      setFeedback({
        type: "error",
        message: "Zorunlu alanları doldurduğunuzdan emin olun.",
      });
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "bookings"), {
        ...form,
        createdAt: serverTimestamp(),
        status: "pending",
        source: "landing-booking",
        customerId: user?.uid ?? null,
        customerEmail: user?.email ?? null,
      });
      setForm(initialForm);
      setFeedback({
        type: "success",
        message: "Randevu talebiniz alındı. Ekiplerimiz en kısa sürede onay için sizinle iletişime geçecek.",
      });
    } catch (error) {
      console.error("[BookingForm] submit error", error);
      setFeedback({
        type: "error",
        message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin ya da telefonla bize ulaşın.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {!user && (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          Hesabınızla giriş yaparsanız randevularınızı müşteri panelinizden takip edebilirsiniz.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-200/70">
          Ad Soyad
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
            placeholder="Adınızı giriniz"
            required
          />
        </label>
        <label className="text-sm text-slate-200/70">
          Telefon
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
            placeholder="05xx xxx xx xx"
            required
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-200/70">
          Hizmet Seçimi
          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
            required
          >
            <option value="" disabled>
              Bir hizmet seçin
            </option>
            {services.map((item) => (
              <option key={item} value={item} className="bg-slate-900">
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-200/70">
          Şube Tercihi
          <select
            name="branch"
            value={form.branch}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
          >
            {branches.map((item) => (
              <option key={item} value={item} className="bg-slate-900">
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-200/70">
          Tercih Edilen Tarih
          <input
            type="date"
            name="preferredDate"
            value={form.preferredDate}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
            required
          />
        </label>
        <label className="text-sm text-slate-200/70">
          Tercih Edilen Saat
          <input
            type="time"
            name="preferredTime"
            value={form.preferredTime}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
            required
          />
        </label>
      </div>
      <label className="text-sm text-slate-200/70">
        Notunuz
        <textarea
          name="notes"
          rows={4}
          value={form.notes}
          onChange={handleChange}
          className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
          placeholder="Özel bir isteğiniz veya hatırlatma notunuz var mı?"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Randevu oluşturuluyor..." : "Randevu Talebi Gönder"}
      </button>
      {feedback && (
        <p
          className={`text-sm ${
            feedback.type === "success" ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
