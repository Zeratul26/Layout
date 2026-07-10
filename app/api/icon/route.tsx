import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let tenantId = searchParams.get("uid") || null;
  if (!tenantId) {
    const { data: { user } } = await supabase.auth.getUser();
    tenantId = user?.id || null;
  }

  // Debug
  if (searchParams.get("debug") === "1") {
    const info = tenantId
      ? await supabase.from("tenants").select("theme_settings").eq("id", tenantId).single()
      : null;
    return NextResponse.json({
      tenantId, found: !!info?.data, settings: info?.data?.theme_settings,
    });
  }

  let primaryColor = "#2563EB";

  if (tenantId) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("theme_settings")
      .eq("id", tenantId)
      .single();

    const s = tenant?.theme_settings;
    if (s?.colors?.primary) primaryColor = s.colors.primary;

    // Priorià a logoBase64 (data URI, senza fetch esterne)
    const logoData = (s?.logoBase64 || s?.logo) as string | undefined;
    if (logoData) {
      if (logoData.startsWith("data:image/")) {
        const [header, b64] = logoData.split(",");
        const mime = header.split(":")[1].split(";")[0];
        return new NextResponse(Buffer.from(b64, "base64"), {
          headers: { "Content-Type": mime, "Cache-Control": "private, max-age=3600" },
        });
      }
      // Se è un URL, fetch
      if (logoData.startsWith("http")) {
        try {
          const resp = await fetch(logoData, { signal: AbortSignal.timeout(5000) });
          if (resp.ok) {
            return new NextResponse(Buffer.from(await resp.arrayBuffer()), {
              headers: {
                "Content-Type": resp.headers.get("content-type") || "image/png",
                "Cache-Control": "private, max-age=3600",
              },
            });
          }
        } catch { /* fallback */ }
      }
    }
  }

  // Fallback: quadrato colorato SVG (funziona su Chrome 96+)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
    <rect width="192" height="192" rx="30" fill="${primaryColor}"/>
  </svg>`;

  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "private, max-age=3600" },
  });
}
