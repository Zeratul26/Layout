import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, companyName } = await request.json();

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Benvenuto in Layout!</h2>
        <p>Ciao,</p>
        <p>La tua azienda <strong>${companyName}</strong> è stata registrata con successo.</p>
        <p>Per attivare il tuo account e iniziare a utilizzare la piattaforma, clicca sul pulsante qui sotto:</p>
        <p>
          <a href="${request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/activate"
             style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            Attiva il mio account
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">Se il pulsante non funziona, copia e incolla questo link nel browser:<br/>
        ${request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/activate</p>
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
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: "paolo.giorsetti@codarini.com", name: "Layout" },
        subject: `Benvenuto in Layout, ${companyName}!`,
        content: [{ type: "text/html", value: htmlContent }]
      })
    });

    const data = res.ok ? { message: "Email sent" } : await res.json();
    return NextResponse.json(
      { ok: res.ok, data },
      { status: res.ok ? 200 : 500 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
