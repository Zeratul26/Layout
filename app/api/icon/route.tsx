import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deflateSync } from "zlib";

function solidPng(w: number, h: number, hex: string): Buffer {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    const row = y * (w * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      const o = row + 1 + x * 3;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }
  const compressed = deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const crc32 = (buf: Buffer) => {
    let c = 0xFFFFFFFF;
    const tbl = new Int32Array(256).map((_, i) => { let cr = i; for (let j = 8; j--;) cr = cr & 1 ? 0xEDB88320 ^ (cr >>> 1) : cr >>> 1; return cr; });
    for (let i = 0; i < buf.length; i++) c = tbl[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  };
  const ck = (type: string, data: Buffer) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const t = Buffer.from(type); const d = Buffer.concat([t, data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(d)); return Buffer.concat([l, t, data, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([sig, ck("IHDR", ihdr), ck("IDAT", compressed), ck("IEND", Buffer.alloc(0))]);
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const uidParam = searchParams.get("uid");
  let tenantId = uidParam && uidParam.length > 0 ? uidParam : null;
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

  // Fallback: quadrato colorato in vero PNG (supportato universalmente come icona PWA)
  return new NextResponse(solidPng(192, 192, primaryColor), {
    headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=3600" },
  });
}
