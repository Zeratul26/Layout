import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function svgIcon(initial: string, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="80" fill="${color}"/>
    <text x="256" y="340" text-anchor="middle" font-family="Inter,sans-serif" font-size="280" font-weight="700" fill="white">${initial}</text>
  </svg>`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let name = "Layout - Gestione Aziendale";
  let shortName = "Layout";
  let bgColor = "#F8FAFC";
  let themeColor = "#2563EB";
  let initial = "L";
  let iconSrc = "";

  if (user) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("theme_settings")
      .eq("id", user.id)
      .single();

    if (tenant?.theme_settings) {
      const settings: any = tenant.theme_settings;
      name = settings.appName || name;
      shortName = (settings.appName || "Layout").slice(0, 12);
      if (settings.colors) {
        bgColor = settings.colors.background || bgColor;
        themeColor = settings.colors.primary || themeColor;
      }
      if (settings.appName) {
        initial = settings.appName.charAt(0).toUpperCase();
      }
      // Logo base64 direttamente nel manifest (zero fetch esterne)
      if (settings.logoBase64 && typeof settings.logoBase64 === "string") {
        iconSrc = settings.logoBase64;
      }
    }
  }

  // Fallback: SVG data URI con iniziale e colore
  if (!iconSrc) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="80" fill="${themeColor}"/></svg>`;
    iconSrc = `data:image/svg+xml;base64,${Buffer.from(svg, "utf-8").toString("base64")}`;
  }

  const manifest = {
    name: name,
    short_name: shortName,
    description: "Piattaforma di gestione aziendale",
    start_url: "/",
    display: "standalone",
    background_color: bgColor,
    theme_color: themeColor,
    icons: [
      { src: iconSrc, sizes: "192x192" },
      { src: iconSrc, sizes: "512x512" }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
