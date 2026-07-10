import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const size = parseInt(searchParams.get("s") || "512");
  const fontSize = Math.round(size * 0.55);

  let initial = "L";
  let primaryColor = "#2563EB";

  if (user) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("theme_settings")
      .eq("id", user.id)
      .single();

    // Se c'è un logo caricato, servilo come PNG
    if (tenant?.theme_settings?.logo) {
      const logo: string = tenant.theme_settings.logo;
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

  // Genera PNG via ImageResponse (universalmente supportato come icona PWA)
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.156),
          backgroundColor: primaryColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: fontSize,
            fontWeight: 700,
            color: "white",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {initial}
        </span>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control": "private, max-age=3600",
      },
    }
  );
}
