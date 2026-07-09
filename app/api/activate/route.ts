// @ts-nocheck
import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Se non loggato, rimanda al login con redirect qui
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "message",
      "Effettua il login per confermare il tuo account."
    );
    loginUrl.searchParams.set("redirect", "/api/activate");
    return NextResponse.redirect(loginUrl);
  }

  // Recupera il tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("status")
    .eq("id", user.id)
    .single();

  if (!tenant) {
    return NextResponse.redirect(
      new URL(
        "/dashboard?error=Tenant+non+trovato.+Contatta+il+supporto.",
        request.url
      )
    );
  }

  if (tenant.status === "active") {
    // Già attivo
    return NextResponse.redirect(
      new URL("/dashboard?message=Account+già+attivo.", request.url)
    );
  }

  // Attiva il tenant
  const { error } = await supabase
    .from("tenants")
    .update({ status: "active" })
    .eq("id", user.id);

  // Verifica che l'aggiornamento sia effettivamente avvenuto
  const { data: updatedTenant } = await supabase
    .from("tenants")
    .select("status")
    .eq("id", user.id)
    .single();

  if (error || updatedTenant?.status !== "active") {
    return NextResponse.redirect(
      new URL(
        "/dashboard?error=Errore+attivazione.+Verifica+che+la+policy+RLS+UPDATE+sia+stata+applicata+su+Supabase.",
        request.url
      )
    );
  }

  // Reindirizza all'onboarding per la configurazione iniziale
  return NextResponse.redirect(new URL("/onboarding", request.url));
}
