import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SahayakAI — सहायक",
  description:
    "Offline-first AI for rural Bharat. No internet? No problem. AI that works where India actually lives.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1B1F3B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
