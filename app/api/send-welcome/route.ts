import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, companyName } = await request.json();

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Benvenuto in Layout!</h2>
        <p>Ciao,</p>
        <p>La tua azienda <strong>${companyName}</strong> è stata registrata con successo.</p>
        <p>Clicca il pulsante qui sotto per attivare il tuo account e personalizzare il tema della tua dashboard.</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${origin}/api/activate"
             style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
            Attiva il tuo account
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px; text-align: center;">
          Se il pulsante non funziona, copia questo link nel browser:<br/>
          <a href="${origin}/api/activate" style="color: #2563eb; font-size: 12px;">${origin}/api/activate</a>
        </p>
        <hr style="margin-top: 32px;" />
        <p style="color: #6b7280; font-size: 12px;">
          Layout - Piattaforma di Gestione Aziendale
        </p>
      </div>
    `;

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: "paolo.giorsetti@codarini.com", name: "Layout" },
        subject: `Benvenuto in Layout, ${companyName}!`,
        content: [{ type: "text/html", value: htmlContent }],
      }),
    });

    const data = res.ok ? { message: "Email sent" } : await res.json();
    return NextResponse.json({ ok: res.ok, data }, { status: res.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
