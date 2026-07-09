// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const THEMES = [
  {
    id: "professionale",
    name: "Professional",
    preview: "bg-blue-600",
    colors: {
      primary: "#2563EB",
      "primary-light": "#DBEAFE",
      secondary: "#1E40AF",
      accent: "#F59E0B",
      background: "#F8FAFC",
      card: "#FFFFFF",
      text: "#0F172A",
      "text-muted": "#64748B"
    }
  },
  {
    id: "natura",
    name: "Nature",
    preview: "bg-green-600",
    colors: {
      primary: "#16A34A",
      "primary-light": "#DCFCE7",
      secondary: "#15803D",
      accent: "#EAB308",
      background: "#F0FDF4",
      card: "#FFFFFF",
      text: "#052E16",
      "text-muted": "#4B5563"
    }
  },
  {
    id: "corallo",
    name: "Coral",
    preview: "bg-rose-500",
    colors: {
      primary: "#F43F5E",
      "primary-light": "#FFE4E6",
      secondary: "#BE123C",
      accent: "#F97316",
      background: "#FFF1F2",
      card: "#FFFFFF",
      text: "#1F2937",
      "text-muted": "#6B7280"
    }
  },
  {
    id: "viola",
    name: "Purple",
    preview: "bg-violet-600",
    colors: {
      primary: "#7C3AED",
      "primary-light": "#EDE9FE",
      secondary: "#5B21B6",
      accent: "#F59E0B",
      background: "#FAF5FF",
      card: "#FFFFFF",
      text: "#1E1B4B",
      "text-muted": "#6D28D9"
    }
  },
  {
    id: "arancione",
    name: "Orange",
    preview: "bg-orange-600",
    colors: {
      primary: "#EA580C",
      "primary-light": "#FFF7ED",
      secondary: "#C2410C",
      accent: "#2563EB",
      background: "#FFF7ED",
      card: "#FFFFFF",
      text: "#1C1917",
      "text-muted": "#78716C"
    }
  },
  {
    id: "scuro",
    name: "Dark",
    preview: "bg-slate-800",
    colors: {
      primary: "#3B82F6",
      "primary-light": "#1E293B",
      secondary: "#94A3B8",
      accent: "#F59E0B",
      background: "#0F172A",
      card: "#1E293B",
      text: "#F8FAFC",
      "text-muted": "#94A3B8"
    }
  }
];

const FONTS = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Playfair Display", value: "Playfair Display, serif" }
];

const COLOR_KEYS = [
  { key: "primary", label: "Colore principale (pulsanti, link)" },
  { key: "background", label: "Sfondo della pagina" },
  { key: "card", label: "Sfondo delle card" },
  { key: "text", label: "Colore del testo" },
  { key: "text-muted", label: "Testo secondario" },
  { key: "primary-light", label: "Sfondo evidenziazioni" }
];
// Calcola la luminanza relativa di un colore hex
function getLuminance(hex: string): number {
  var r = parseInt(hex.slice(1, 3), 16) / 255;
  var g = parseInt(hex.slice(3, 5), 16) / 255;
  var b = parseInt(hex.slice(5, 7), 16) / 255;
  r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Verifica il contrasto tra due colori (WCAG ratio)
function hasContrast(hex1: string, hex2: string): number {
  var l1 = getLuminance(hex1);
  var l2 = getLuminance(hex2);
  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
export default function OnboardingPage() {
  var router = useRouter();
  var supabase = createClient();
  var fileInputRef = useRef(null);

  var [appName, setAppName] = useState("La mia app");
  var [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  var [customColors, setCustomColors] = useState({ ...THEMES[0].colors });
  var [selectedFont, setSelectedFont] = useState(FONTS[0]);
  var [logoPreview, setLogoPreview] = useState(null);
  var [saving, setSaving] = useState(false);

  var colors = customColors;

  // Proteggi la route: se non loggato, redirect al login
  useEffect(function () {
    supabase.auth.getUser().then(function (result) {
      if (!result.data.user) {
        router.push("/login?error=Devi+effettuare+il+login+per+accedere");
      }
    });
  }, []);

  // Carica il font selezionato da Google Fonts
  useEffect(
    function () {
      var fontName = selectedFont.value.split(",")[0].trim().replace(/ /g, "+");
      var linkId = "google-font-theme";
      var existing = document.getElementById(linkId);
      if (existing) {
        existing.remove();
      }
      var link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=" +
        fontName +
        ":wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    },
    [selectedFont]
  );

  function pickTheme(theme: any) {
    setSelectedTheme(theme);
    setCustomColors({ ...theme.colors });
  }

  function updateColor(key: string, value: string) {
    setCustomColors(function (prev: any) {
      var next: any = {};
      for (var k in prev) {
        next[k] = prev[k];
      }
      next[key] = value;
      return next;
    });
  }

  function handleLogoUpload(e: any) {
    var file = e.target.files?.[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (event) {
      setLogoPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      var themeSettings = {
        appName: appName,
        theme: "personalizzato",
        colors: colors,
        font: selectedFont.value,
        fontName: selectedFont.name,
        logo: logoPreview
      };
      var user = await supabase.auth.getUser();
      var result = await supabase
        .from("tenants")
        .update({ theme_settings: themeSettings })
        .eq("id", user.data.user?.id);
      if (result.error) throw result.error;
      await supabase.auth.signOut();
      router.push(
        "/login?message=Configurazione+completata!+Effettua+il+login+per+accedere+con+il+nuovo+tema."
      );
      router.refresh();
    } catch (err) {
      alert("Errore durante il salvataggio. Riprova.");
    } finally {
      setSaving(false);
    }
  }

  // ---------- PREVIEW: Login Page Mockup ----------
  function LoginPreview() {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundColor: colors.background,
          fontFamily: selectedFont.value
        }}
      >
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="h-10 mx-auto mb-4 object-contain"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: colors.primary }}
              >
                L
              </div>
            )}
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              {appName}
            </h1>
            <p className="text-sm mt-1" style={{ color: colors["text-muted"] }}>
              Sign in to your account
            </p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-6 shadow-lg border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors["text-muted"] + "20"
            }}
          >
            <div className="space-y-4">
              {/* Email field */}
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: colors["text-muted"] }}
                >
                  Email
                </label>
                <div
                  className="w-full rounded-lg px-3 py-2.5 border text-sm"
                  style={{
                    borderColor: colors["text-muted"] + "30",
                    color: colors.text,
                    backgroundColor: colors.background
                  }}
                >
                  john@company.com
                </div>
              </div>
              {/* Password field */}
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{ color: colors["text-muted"] }}
                >
                  Password
                </label>
                <div
                  className="w-full rounded-lg px-3 py-2.5 border text-sm"
                  style={{
                    borderColor: colors["text-muted"] + "30",
                    color: colors.text,
                    backgroundColor: colors.background
                  }}
                >
                  ••••••••
                </div>
              </div>
              {/* Submit button */}
              <button
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: colors.primary }}
              >
                Sign in
              </button>
            </div>

            {/* Footer */}
            <p
              className="text-xs text-center mt-4"
              style={{ color: colors["text-muted"] }}
            >
              Don&apos;t have an account?{" "}
              <span style={{ color: colors.primary }}>Sign up</span>
            </p>
          </div>

          {/* Theme badge */}
          <p
            className="text-[10px] text-center mt-4"
            style={{ color: colors["text-muted"] }}
          >
            {"Tema personalizzato"} &middot; {selectedFont.name}
          </p>
        </div>
      </div>
    );
  }

  // ---------- MAIN ----------
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: colors.background }}
    >
      {/* LEFT PANEL: Settings */}
      <div
        className="w-1/2 flex-shrink-0 overflow-y-auto relative"
        style={{ backgroundColor: colors.card }}
      >
        {/* Linea divisoria verticale */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[2px]"
          style={{ backgroundColor: colors["text-muted"] + "45" }}
        />
        <div className="p-6 space-y-6">
          <div>
            <h1
              className="text-lg font-bold"
              style={{ color: colors.text, fontFamily: selectedFont.value }}
            >
              Theme settings
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: colors["text-muted"] }}
            >
              Customize your brand appearance
            </p>
          </div>

          {/* THEMES */}
          <div>
            <h2
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors["text-muted"] }}
            >
              Tema predefinito
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(function (t) {
                var active = selectedTheme.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={function () {
                      pickTheme(t);
                    }}
                    className={
                      "rounded-lg transition-all overflow-hidden " +
                      (active ? "border-[3px]" : "border border-gray-300")
                    }
                    style={{
                      borderColor: active ? t.colors.primary : undefined
                    }}
                  >
                    <div className={"h-5 " + t.preview} />
                    <div className="py-0.5 text-center">
                      <span
                        className="text-[9px] font-medium"
                        style={{ color: t.colors.text }}
                      >
                        {t.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUSTOM */}
          <div>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_KEYS.map(function (item) {
                return (
                  <div key={item.key} className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={customColors[item.key]}
                      onChange={function (e) {
                        updateColor(item.key, e.target.value);
                      }}
                      className="w-7 h-7 rounded border border-gray-300 cursor-pointer p-0.5 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <label className="block text-[9px] font-medium text-gray-500 truncate">
                        {item.label}
                      </label>
                      <span className="text-[9px] font-mono text-gray-400">
                        {customColors[item.key]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Avvisi contrasto */}
            {(function () {
              var bg = customColors.background;
              var txt = customColors.text;
              var card = customColors.card;
              var ratioTxt = hasContrast(txt, bg);
              var ratioCard = hasContrast(txt, card);
              var warnings = [];
              if (ratioTxt < 3) {
                warnings.push(
                  "Testo e sfondo pagina troppo simili (ratio " +
                    ratioTxt.toFixed(1) +
                    ")"
                );
              }
              if (ratioCard < 3) {
                warnings.push(
                  "Testo e sfondo card troppo simili (ratio " +
                    ratioCard.toFixed(1) +
                    ")"
                );
              }
              if (warnings.length > 0) {
                return (
                  <div className="mt-2 p-2 rounded-lg text-[10px] bg-red-50 border border-red-200 text-red-700">
                    {warnings.map(function (w, i) {
                      return <p key={i}>⚠️ {w}</p>;
                    })}
                    <p className="mt-1 text-red-500">
                      Suggerimento: scegli un testo chiaro su sfondo scuro o
                      viceversa.
                    </p>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* LOGO */}
          <div>
            <h2
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors["text-muted"] }}
            >
              Logo aziendale
            </h2>
            <div className="flex items-start gap-3">
              <div
                className="border-2 border-dashed rounded-xl text-center cursor-pointer hover:opacity-80 transition-all w-16 h-16 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: colors.primary + "50",
                  backgroundColor: colors["primary-light"]
                }}
                onClick={function () {
                  fileInputRef.current?.click();
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain p-1"
                  />
                ) : (
                  <svg
                    className="h-5 w-5"
                    style={{ color: colors.primary }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
              {logoPreview && (
                <button
                  onClick={function () {
                    setLogoPreview(null);
                  }}
                  className="text-[10px] text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>{" "}
            <p
              className="text-[9px] mt-1.5"
              style={{ color: colors["text-muted"] }}
            >
              ⓘ Questa immagine verr&agrave; usata come logo nella dashboard e
              come icona dell&apos;app installata.
            </p>{" "}
          </div>

          {/* APP NAME */}
          <div>
            <h2
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors["text-muted"] }}
            >
              Nome app
            </h2>
            <input
              type="text"
              value={appName}
              onChange={function (e) {
                setAppName(e.target.value);
              }}
              placeholder="Es: Idraulica Service"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: colors["text-muted"] + "30",
                color: colors.text,
                backgroundColor: colors.background,
                fontFamily: selectedFont.value
              }}
            />
          </div>

          {/* FONT */}
          <div>
            <h2
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: colors["text-muted"] }}
            >
              Carattere (Font)
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {FONTS.map(function (f) {
                var active = selectedFont.name === f.name;
                return (
                  <button
                    key={f.name}
                    onClick={function () {
                      setSelectedFont(f);
                    }}
                    className={
                      "px-2.5 py-1 rounded-lg border text-[11px] transition-all " +
                      (active
                        ? "text-white shadow-sm"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300")
                    }
                    style={Object.assign(
                      { fontFamily: f.value },
                      active
                        ? {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary
                          }
                        : {}
                    )}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SAVE */}
          <div className="pt-12 text-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2.5 rounded-xl font-semibold text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-50 text-sm"
              style={{ backgroundColor: colors.primary }}
            >
              {saving
                ? "Salvataggio in corso..."
                : "Salva e vai alla Dashboard"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Live Preview */}
      <div className="flex-1 flex flex-col">
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            borderColor: colors["text-muted"] + "15",
            backgroundColor: colors.card
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span
              className="text-[10px] ml-2 font-mono"
              style={{ color: colors["text-muted"] }}
            >
              preview — login page
            </span>
          </div>
          <span className="text-[10px]" style={{ color: colors["text-muted"] }}>
            Live
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <LoginPreview />
        </div>
      </div>
    </div>
  );
}
