import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">{user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Dati Azienda
            </h2>
            <dl className="mt-4 divide-y divide-gray-200">
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Nome Azienda
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {tenant?.company_name || "—"}
                </dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.email}
                </dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Stato</dt>
                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tenant?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {tenant?.status === "active" ? "Attivo" : "In attesa"}
                  </span>
                </dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Data registrazione
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {tenant?.created_at
                    ? new Date(tenant.created_at).toLocaleDateString("it-IT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
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
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            &larr; Torna alla home
          </Link>
        </div>
      </main>
    </div>
  );
}
