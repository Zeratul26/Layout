import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Default icon come SVG inline (la lettera L)
const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#2563EB"/>
  <text x="256" y="340" text-anchor="middle" font-family="Inter,sans-serif" font-size="280" font-weight="700" fill="white">L</text>
</svg>`;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Default: icona con la lettera L
  let svgContent = DEFAULT_SVG;

  if (user) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("theme_settings")
      .eq("id", user.id)
      .single();

    if (tenant?.theme_settings?.logo) {
      const logo: string = tenant.theme_settings.logo;
      // Se il logo è in base64, lo estraiamo
      if (logo.startsWith("data:image/")) {
        const parts = logo.split(",");
        const mime = parts[0].split(":")[1].split(";")[0];
        const base64 = parts[1];
        const buffer = Buffer.from(base64, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "private, max-age=3600"
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
      const initial = tenant.theme_settings.appName.charAt(0).toUpperCase();
      const primaryColor = tenant.theme_settings?.colors?.primary || "#2563EB";
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
