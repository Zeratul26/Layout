import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Layout - Gestione Aziendale",
  description: "Piattaforma di gestione per la tua azienda"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/api/manifest" />
        <link rel="icon" href="/api/icon" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
