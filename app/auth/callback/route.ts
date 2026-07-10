import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Attiva il tenant direttamente qui (nessun secondo redirect)
      await supabase
        .from("tenants")
        .update({ status: "active" })
        .eq("id", data.user.id);

      return NextResponse.redirect(`${origin}/login?message=Account+attivato!+Accedi+dal+tuo+PC+per+configurare+la+tua+dashboard.`);
    }
  }

  // Errore: codice non valido o scaduto
  return NextResponse.redirect(
    `${origin}/auth/error?message=Codice+di+verifica+non+valido+o+scaduto.+Richiedi+una+nuova+email.`
  );
}
