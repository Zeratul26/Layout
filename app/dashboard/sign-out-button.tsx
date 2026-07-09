"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
    >
      Esci
    </button>
  );
}
