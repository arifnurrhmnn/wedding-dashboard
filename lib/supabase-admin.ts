import { createClient } from "@supabase/supabase-js";

export class SupabaseAdminConfigurationError extends Error {
  constructor() {
    super(
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib dikonfigurasi"
    );
    this.name = "SupabaseAdminConfigurationError";
  }
}

/**
 * Create the privileged Supabase client only while handling a request.
 * Keeping this lazy prevents Next.js builds from evaluating a missing secret.
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new SupabaseAdminConfigurationError();
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
