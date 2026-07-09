import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  var name = "Layout - Gestione Aziendale";
  var shortName = "Layout";
  var bgColor = "#F8FAFC";
  var themeColor = "#2563EB";
  var iconUrl = request.url.replace("/api/manifest", "/api/icon");

  if (user) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("theme_settings")
      .eq("id", user.id)
      .single();

    if (tenant?.theme_settings) {
      var settings = tenant.theme_settings;
      name = settings.appName || name;
      shortName = (settings.appName || "Layout").slice(0, 12);
      if (settings.colors) {
        bgColor = settings.colors.background || bgColor;
        themeColor = settings.colors.primary || themeColor;
      }
    }
  }

  var manifest = {
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
