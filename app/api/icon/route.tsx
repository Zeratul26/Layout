import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  // Supporta uid passato come query param (per icone PWA senza auth cookie)
  let tenantId = searchParams.get("uid") || null;
  if (!tenantId) {
    const { data: { user } } = await supabase.auth.getUser();
    tenantId = user?.id || null;
  }

  // Debug: se ?debug=1, mostra info invece dell'immagine
  if (searchParams.get("debug") === "1") {
    const tenantInfo = tenantId
      ? await supabase.from("tenants").select("theme_settings").eq("id", tenantId).single()
      : null;
    return NextResponse.json({
      tenantId: tenantId,
      tenantFound: !!tenantInfo?.data,
      hasLogo: !!tenantInfo?.data?.theme_settings?.logo,
      logoUrl: tenantInfo?.data?.theme_settings?.logo,
      appName: tenantInfo?.data?.theme_settings?.appName,
    });
  }

  let initial = "L";
  let primaryColor = "#2563EB";

  if (tenantId) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("theme_settings")
      .eq("id", tenantId)
      .single();

    // Se c'è un logo (URL storage), redirect
    if (tenant?.theme_settings?.logo) {
      const logo: string = tenant.theme_settings.logo;
      if (logo.startsWith("http")) {
        return NextResponse.redirect(logo, { headers: { "Cache-Control": "private, max-age=3600" } });
      }
    }
      if (logo.startsWith("http")) {
        return NextResponse.redirect(logo);
      }
    }

    // Nessun logo: usa iniziale e colore dal tema
    if (tenant?.theme_settings?.appName) {
      initial = tenant.theme_settings.appName.charAt(0).toUpperCase();
    }
    if (tenant?.theme_settings?.colors?.primary) {
      primaryColor = tenant.theme_settings.colors.primary;
    }
  }

  // Genera SVG (supportato da Chrome 96+ come icona PWA)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="80" fill="${primaryColor}"/>
    <text x="256" y="340" text-anchor="middle" font-family="Inter,sans-serif" font-size="280" font-weight="700" fill="white">${initial}</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "private, max-age=3600"
    }
  });
}
