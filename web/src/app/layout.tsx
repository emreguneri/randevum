import { LiveChatWidget } from "@/components/live-chat-widget";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Randevum | Randevu Sistemi ile Çalışan İşletmeler İçin Yönetim Platformu",
  description:
    "Randevum, berber, kuaför, güzellik salonu, pilates ve terapi merkezlerinin randevu yönetimi, personel planlama ve müşteri iletişimini tek platformda yönetmesini sağlar.",
  metadataBase: new URL("https://onlinerandevum.com"),
  openGraph: {
    title: "Randevum",
    description:
      "Randevum ile berber, kuaför, güzellik salonu, pilates ve terapi merkezleri için uçtan uca yönetim platformu.",
    url: "https://onlinerandevum.com",
    siteName: "Randevum",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${fontSans.variable} antialiased text-slate-50`} style={{ backgroundColor: '#131010' }}>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyCEtk1HSycs-zPTNAQxrkLqBBw45tERfCQ&libraries=places`}
          strategy="lazyOnload"
        />
        <Providers>
          <Navbar />
          {children}
          <LiveChatWidget />
        </Providers>
      </body>
    </html>
  );
}
