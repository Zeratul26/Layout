"use client";

import { useEffect, useState } from "react";

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Verifica se è già installata
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setSupported(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Registra service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  if (isInstalled) return null;

  return supported ? (
    <button
      onClick={handleInstall}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
    >
      Installa App
    </button>
  ) : null;
}
