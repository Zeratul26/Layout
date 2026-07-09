"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") ||
    "Si è verificato un errore durante l'autenticazione.";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icona */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Errore di Autenticazione
        </h1>

        <p className="text-sm text-gray-600">{message}</p>

        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Torna al Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Non hai un account? Registrati
          </Link>
        </div>
      </div>
    </div>
  );
}
