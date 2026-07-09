// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Default icon come SVG inline (la lettera L)
var DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#2563EB"/>
  <text x="256" y="340" text-anchor="middle" font-family="Inter,sans-serif" font-size="280" font-weight="700" fill="white">L</text>
</svg>`;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Default: icona con la lettera L
  var svgContent = DEFAULT_SVG;
  var isSvg = true;

  if (user) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("theme_settings")
      .eq("id", user.id)
      .single();

    if (tenant?.theme_settings?.logo) {
      var logo = tenant.theme_settings.logo;
      // Se il logo è in base64, lo estraiamo
      if (logo.startsWith("data:image/")) {
        var parts = logo.split(",");
        var mime = parts[0].split(":")[1].split(";")[0];
        var base64 = parts[1];
        var buffer = Buffer.from(base64, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "private, max-age=86400"
          }
        });
      }
      // Se è un URL diretto, reindirizza
      if (logo.startsWith("http")) {
        return NextResponse.redirect(logo);
      }
    }

    // Se c'è appName ma non logo, genera icona con iniziale
    if (tenant?.theme_settings?.appName) {
      var initial = tenant.theme_settings.appName.charAt(0).toUpperCase();
      var primaryColor = tenant.theme_settings?.colors?.primary || "#2563EB";
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
        <rect width="512" height="512" rx="80" fill="${primaryColor}"/>
        <text x="256" y="340" text-anchor="middle" font-family="Inter,sans-serif" font-size="280" font-weight="700" fill="white">${initial}</text>
      </svg>`;
    }
  }

  return new NextResponse(svgContent, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "private, max-age=86400"
    }
  });
}
