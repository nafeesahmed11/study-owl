import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client — the single entry point for Auth + Postgres.
 *
 * Reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from the environment
 * (see `.env.example`). Every `VITE_*` value is inlined into the browser
 * bundle by Vite, so only the publishable anon key may live there — never a
 * service_role key. Both names are read exactly as documented in AGENTS.md.
 *
 * Fails fast with an actionable message when unconfigured, so a missing env
 * var shows up as one clear error instead of silent auth failures.
 */

/** Build-time env bag. `import.meta.env` is provided by Vite (see vite-env.d.ts). */
const env = import.meta.env as Record<string, string | undefined>;

const url = env.VITE_SUPABASE_URL?.trim();
const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

if (!url || !anonKey) {
  throw new Error(
    "Supabase is not configured: missing VITE_SUPABASE_URL and/or " +
      "VITE_SUPABASE_ANON_KEY. Copy .env.example to .env, fill in both " +
      "values (Supabase dashboard → Project Settings → API), and restart " +
      "the dev server."
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    // Session is persisted (localStorage) and refreshed automatically;
    // onAuthStateChange in AuthContext keeps the React state in sync.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
