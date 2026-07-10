"use client";

import { useEffect, useState } from "react";

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    setIsMobile(/android|iphone|ipad|ipod/i.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => {
        // Se after 3 secondi beforeinstallprompt non è ancora arrivato,
        // mostra comunque il pulsante su browser supportati (Chrome/Edge)
        setTimeout(() => {
          setShowButton((current) => current || "serviceWorker" in navigator);
        }, 3000);
      });
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

  if (showButton) {
    return (
      <button
        onClick={handleInstall}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
      >
        Installa App
      </button>
    );
  }

  // Fallback: mostra istruzioni manuali
  return (
    <div className="text-xs text-gray-500">
      {isMobile ? (
        <p>
          Dal browser: <strong>Condividi</strong> {"→"}{" "}
          <strong>Aggiungi alla schermata Home</strong>
        </p>
      ) : (
        <p>
          Chrome: clicca l&apos;icona <strong>⋮</strong> {"→"}{" "}
          <strong>Installa Layout</strong>
        </p>
      )}
    </div>
  );
}
