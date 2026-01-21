import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Arabanla Eve Admin",
  description: "Ops console for trips, drivers, pricing, disputes, payouts",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

