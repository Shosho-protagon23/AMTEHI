import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Supabase ADMIN client (service role).
 * ⚠️ Hanya untuk backend. Service role bypass RLS — jangan pernah expose ke client.
 * Dipakai untuk verifikasi token (getUser) & operasi storage admin.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
