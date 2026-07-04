import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client untuk browser (anon key).
 * Hanya untuk fitur publik/Realtime — autentikasi sensitif lewat API backend
 * agar token tersimpan di httpOnly cookie, bukan localStorage.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Peringatan saat dev jika env belum diset
  console.warn(
    '[AMTEHI] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diset.',
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
);
