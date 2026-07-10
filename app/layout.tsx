import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Layout - Gestione Aziendale",
  description: "Piattaforma di gestione per la tua azienda",
  icons: {
    icon: "/api/icon?s=32",
    apple: "/api/icon?s=192",
  },
  appleWebApp: {
    capable: true,
    title: "Layout",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <link rel="manifest" href={`/api/manifest?_=${Date.now()}`} />
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
