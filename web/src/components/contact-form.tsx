"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { db } from "@/lib/firebase";

const initialForm = {
  business: "",
  name: "",
  phone: "",
  city: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<null | { type: "success" | "error"; message: string }>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    if (!form.business || !form.name || !form.phone) {
      setFeedback({ type: "error", message: "Lütfen işletme adı, ad soyad ve telefon alanlarını doldurun." });
      return;
    }

    try {
      setSubmitting(true);
      await addDoc(collection(db, "web_inquiries"), {
        ...form,
        createdAt: serverTimestamp(),
        source: "landing-contact",
      });
      setForm(initialForm);
      setFeedback({ type: "success", message: "Talebiniz alındı. Danışmanlarımız en kısa sürede sizinle iletişime geçecek." });
    } catch (error) {
      console.error("[ContactForm] submit error", error);
      setFeedback({
        type: "error",
        message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin veya destek hattımızla iletişime geçin.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {[
        { label: "İşletme Adı", type: "text", name: "business" },
        { label: "Ad Soyad", type: "text", name: "name" },
        { label: "Telefon", type: "tel", name: "phone" },
        { label: "Şehir", type: "text", name: "city" },
      ].map((field) => (
        <label key={field.name} className="text-sm text-slate-200/70">
          {field.label}
          <input
            type={field.type}
            name={field.name}
            value={(form as Record<string, string>)[field.name]}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
            placeholder={`${field.label} giriniz`}
            required={field.name === "business" || field.name === "name" || field.name === "phone"}
          />
        </label>
      ))}
      <label className="text-sm text-slate-200/70">
        Notunuz
        <textarea
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
          placeholder="İhtiyaçlarınızı kısaca paylaşın"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Gönderiliyor..." : "Beni Arayın"}
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
