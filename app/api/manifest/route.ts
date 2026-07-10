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
    }
  }

  const manifest = {
    name: name,
    short_name: shortName,
    description: "Piattaforma di gestione aziendale",
    start_url: "/login",
    display: "standalone",
    background_color: bgColor,
    theme_color: themeColor,
    icons: [{ src: iconUrl, sizes: "512x512", type: "image/png" }]
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
