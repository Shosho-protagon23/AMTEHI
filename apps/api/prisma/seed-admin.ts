/**
 * Seed akun ADMIN untuk AMTEHI.
 *
 * Membuat satu user admin di Supabase Auth lalu memastikan row `profiles`-nya
 * ada dengan role 'admin'. Aman dijalankan berulang (idempotent): jika email
 * sudah terdaftar, script hanya mem-promote profilnya menjadi admin.
 *
 * Jalankan dari folder apps/api:
 *   npm run seed:admin
 *
 * Kredensial bisa di-override lewat env (opsional):
 *   ADMIN_EMAIL=admin@amikom.ac.id ADMIN_PASSWORD=RahasiaKuat123 npm run seed:admin
 *
 * ⚠️ Memakai SUPABASE_SERVICE_ROLE_KEY — hanya untuk backend/lokal.
 */
import { supabaseAdmin } from '../src/lib/supabase.js';
import { prisma } from '../src/lib/prisma.js';

// Default demo — sebaiknya ganti password setelah login pertama.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@amikom.ac.id';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'AdminAmtehi123!';
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Admin AMTEHI';

/**
 * Cari user auth berdasarkan email dengan menelusuri halaman daftar user.
 * Supabase belum menyediakan lookup-by-email langsung di service SDK.
 */
async function findAuthUserByEmail(email: string) {
  const target = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  // Telusuri sampai halaman kosong (batas wajar untuk proyek skala kampus).
  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw new Error(`Gagal memeriksa user existing: ${error.message}`);
    }

    const found = data.users.find((u) => u.email?.toLowerCase() === target);
    if (found) return found;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  console.log('🌱 Seeding akun admin AMTEHI...');

  // 1. Pastikan user ada di Supabase Auth (buat baru bila belum ada).
  const existing = await findAuthUserByEmail(ADMIN_EMAIL);
  let userId: string;

  if (existing) {
    userId = existing.id;
    console.log(`ℹ️  User sudah ada di Auth (${ADMIN_EMAIL}) — akan di-promote.`);
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME },
    });
    if (error || !data.user) {
      throw new Error(`Gagal membuat user admin: ${error?.message ?? 'unknown'}`);
    }
    userId = data.user.id;
    console.log(`✅ User Auth dibuat: ${ADMIN_EMAIL}`);
  }

  // 2. Upsert profile dengan role admin (jaring pengaman bila trigger DB gagal).
  await prisma.profile.upsert({
    where: { id: userId },
    update: { role: 'admin', fullName: ADMIN_NAME },
    create: { id: userId, fullName: ADMIN_NAME, role: 'admin' },
  });

  console.log('✅ Profile di-set sebagai admin.');
  console.log('\n─────────────────────────────────────');
  console.log('  Akun admin siap digunakan:');
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log('─────────────────────────────────────');
  console.log('  ⚠️  Ganti password setelah login pertama.\n');
}

main()
  .catch((err) => {
    console.error('❌ Seed admin gagal:', err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
