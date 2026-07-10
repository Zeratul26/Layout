import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let name = "Layout - Gestione Aziendale";
  let shortName = "Layout";
  let bgColor = "#F8FAFC";
  let themeColor = "#2563EB";
  const iconUrl = request.url.replace("/api/manifest", "/api/icon");

  let iconVersion = "";
  if (user) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("theme_settings, updated_at")
      .eq("id", user.id)
      .single();

    if (tenant?.updated_at) {
      iconVersion = `&v=${new Date(tenant.updated_at).getTime()}`;
    }

    if (tenant?.theme_settings) {
      const settings: any = tenant.theme_settings;
      name = settings.appName || name;
      shortName = (settings.appName || "Layout").slice(0, 12);
      if (settings.colors) {
        bgColor = settings.colors.background || bgColor;
        themeColor = settings.colors.primary || themeColor;
      }
    }
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
      { src: iconUrl + "?s=192" + iconVersion, sizes: "192x192" },
      { src: iconUrl + "?s=512" + iconVersion, sizes: "512x512" }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
