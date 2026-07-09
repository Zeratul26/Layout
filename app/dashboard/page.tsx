import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=Devi effettuare il login per accedere");
  }

  // Recupera i dati del tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", user.id)
    .single();

  // Se il tenant non ha ancora impostato il tema, reindirizza all'onboarding
  if (tenant && !tenant.theme_settings) {
    redirect("/onboarding");
  }

  const activated = searchParams.activated === "true";
  const onboarded = searchParams.onboarded === "true";
  const successMessage = searchParams.message?.toString();
  const errorMessage = searchParams.error?.toString();

  // Tema tenant
  const theme = tenant?.theme_settings as {
    appName?: string;
    colors?: Record<string, string>;
    font?: string;
    fontName?: string;
    logo?: string | null;
  } | null;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme?.colors?.background || "#F8FAFC",
        fontFamily: theme?.font || "inherit"
      }}
    >
      {/* Navbar */}
      <nav
        className="shadow-sm border-b"
        style={{
          backgroundColor: theme?.colors?.card || "#FFFFFF",
          borderColor: theme?.colors?.primary || "#E5E7EB"
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              {theme?.logo && (
                <img
                  src={theme.logo}
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                />
              )}
              <h1
                className="text-xl font-semibold"
                style={{ color: theme?.colors?.text || "#0F172A" }}
              >
                {theme?.appName || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="text-sm"
                style={{ color: theme?.colors?.["text-muted"] || "#64748B" }}
              >
                {user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Messaggi da URL */}
        {onboarded && (
          <div
            className="mb-8 rounded-md p-4 border"
            style={{
              backgroundColor: theme?.colors?.["primary-light"] || "#EFF6FF",
              borderColor: theme?.colors?.primary || "#BFDBFE",
              color: theme?.colors?.primary || "#1D4ED8"
            }}
          >
            <p className="text-sm font-medium">
              Configurazione completata! Benvenuto nella tua dashboard
              personalizzata.
            </p>
          </div>
        )}
        {activated && (
          <div className="mb-8 rounded-md bg-green-50 border border-green-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Account attivato con successo!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Il tuo account è ora attivo. Puoi iniziare a utilizzare tutte
                  le funzionalità della piattaforma.
                </p>
              </div>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="mb-8 rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-8 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Stato account */}
        <div className="mb-8">
          {tenant?.status === "pending" && (
            <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Account in attesa di approvazione
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    La tua registrazione è stata completata. Un amministratore
                    dovrà approvare il tuo account prima che tu possa utilizzare
                    tutte le funzionalità.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tenant?.status === "active" && (
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Account attivo
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    Il tuo account è attivo e puoi utilizzare tutte le
                    funzionalità della piattaforma.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scheda Azienda */}
        <div
          className="overflow-hidden rounded-lg shadow"
          style={{
            backgroundColor: theme?.colors?.card || "#FFFFFF"
          }}
        >
          <div className="px-4 py-5 sm:p-6">
            <h2
              className="text-lg font-medium"
              style={{ color: theme?.colors?.text || "#0F172A" }}
            >
              Dati Azienda
            </h2>
            <dl
              className="mt-4 divide-y"
              style={{
                borderColor: theme?.colors?.primary
                  ? theme.colors.primary + "20"
                  : "#E5E7EB"
              }}
            >
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt
                  className="text-sm font-medium"
                  style={{ color: theme?.colors?.["text-muted"] || "#64748B" }}
                >
                  Nome Azienda
                </dt>
                <dd
                  className="mt-1 text-sm sm:col-span-2 sm:mt-0"
                  style={{ color: theme?.colors?.text || "#0F172A" }}
                >
                  {tenant?.company_name || "—"}
                </dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt
                  className="text-sm font-medium"
                  style={{ color: theme?.colors?.["text-muted"] || "#64748B" }}
                >
                  Email
                </dt>
                <dd
                  className="mt-1 text-sm sm:col-span-2 sm:mt-0"
                  style={{ color: theme?.colors?.text || "#0F172A" }}
                >
                  {user.email}
                </dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt
                  className="text-sm font-medium"
                  style={{ color: theme?.colors?.["text-muted"] || "#64748B" }}
                >
                  Stato
                </dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor:
                        tenant?.status === "active"
                          ? (theme?.colors?.primary || "#2563EB") + "20"
                          : "#FEF3C7",
                      color:
                        tenant?.status === "active"
                          ? theme?.colors?.primary || "#2563EB"
                          : "#92400E"
                    }}
                  >
                    {tenant?.status === "active" ? "Attivo" : "In attesa"}
                  </span>
                </dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt
                  className="text-sm font-medium"
                  style={{ color: theme?.colors?.["text-muted"] || "#64748B" }}
                >
                  Data registrazione
                </dt>
                <dd
                  className="mt-1 text-sm sm:col-span-2 sm:mt-0"
                  style={{ color: theme?.colors?.text || "#0F172A" }}
                >
                  {tenant?.created_at
                    ? new Date(tenant.created_at).toLocaleDateString("it-IT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Link utili */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: theme?.colors?.primary || "#2563EB" }}
          >
            &larr; Torna alla home
          </Link>
        </div>
      </main>
    </div>
  );
}
