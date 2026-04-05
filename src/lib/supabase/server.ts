import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { looksLikeSupabaseJwtKey, normalizeSupabaseKey } from "@/lib/supabase/jwt";

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = normalizeSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (process.env.NODE_ENV === "development") {
    if (!url || !looksLikeSupabaseJwtKey(anon)) {
      console.warn(
        "[togyz] Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to the values from Supabase → Settings → API (anon public key is a long JWT with two dots)."
      );
    }
  }

  return createServerClient(
    url!,
    anon,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — can't set cookies
          }
        },
      },
    }
  );
}
