import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Il tenant è già stato creato dal trigger su auth.users
      // Redirect diretto alla dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Errore: codice non valido o scaduto
  return NextResponse.redirect(
    `${origin}/auth/error?message=Codice di verifica non valido o scaduto. Richiedi una nuova email.`
  );
}
