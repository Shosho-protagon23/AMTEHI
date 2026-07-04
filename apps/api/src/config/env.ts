import 'dotenv/config';
import { z } from 'zod';

/**
 * Validasi environment variables saat startup.
 * Jika ada yang kurang/salah, proses langsung berhenti dengan pesan jelas.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  SUPABASE_URL: z.string().url('SUPABASE_URL harus berupa URL valid'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY wajib diisi'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY wajib diisi'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),

  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Konfigurasi environment tidak valid:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
