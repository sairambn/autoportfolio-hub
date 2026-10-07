// Supabase client — optional. Site works in guest/localStorage mode without it.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { brokeredPreviewStorage } from "./previewAuthStorage";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseClient(): SupabaseClient<Database> | null {
  const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY =
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    // Guest / localStorage mode — no crash
    if (typeof console !== "undefined") {
      console.info("[Supabase] Not configured — running in local browser mode.");
    }
    return null;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
    },
    auth: {
      storage: brokeredPreviewStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: SupabaseClient<Database> | null | undefined;

function getClient(): SupabaseClient<Database> | null {
  if (_supabase === undefined) _supabase = createSupabaseClient();
  return _supabase;
}

/** True when Supabase env vars are set. */
export function isSupabaseConfigured(): boolean {
  return getClient() !== null;
}

// Safe proxy — methods no-op or throw a clear message only when actually used
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop, receiver) {
    const client = getClient();
    if (!client) {
      if (prop === "auth") {
        return new Proxy(
          {},
          {
            get() {
              return async () => ({ data: null, error: new Error("Supabase not configured") });
            },
          },
        );
      }
      return undefined;
    }
    return Reflect.get(client, prop, receiver);
  },
});
