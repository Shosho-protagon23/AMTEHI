'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAuth } from '@/hooks/use-auth';

/** Dashboard user sederhana — placeholder yang sudah terhubung ke profil. */
export default function DashboardPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);

  useEffect(() => {
    if (!user) {
      void fetchMe();
    }
  }, [user, fetchMe]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <p className="font-mono text-sm text-secondary">$ whoami</p>
        <h1 className="mt-2 text-2xl font-bold">
          {user ? `Halo, ${user.fullName}` : 'Dashboard'}
        </h1>

        {!user && (
          <p className="mt-2 text-muted">
            Anda belum masuk.{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-secondary hover:underline"
            >
              Masuk dulu
            </button>
            .
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/items/lost/new" className="card-surface hover:border-primary">
            <p className="font-mono text-sm text-primary">$ lapor --hilang</p>
            <h3 className="mt-2 font-semibold">Lapor Barang Hilang</h3>
            <p className="mt-1 text-sm text-muted">
              Laporkan barang Anda yang hilang.
            </p>
          </Link>
          <Link href="/items/found/new" className="card-surface hover:border-primary">
            <p className="font-mono text-sm text-accent">$ lapor --temuan</p>
            <h3 className="mt-2 font-semibold">Lapor Barang Temuan</h3>
            <p className="mt-1 text-sm text-muted">
              Umumkan barang temuan agar kembali ke pemiliknya.
            </p>
          </Link>
          <Link href="/claims" className="card-surface hover:border-primary">
            <p className="font-mono text-sm text-secondary">$ claim --list</p>
            <h3 className="mt-2 font-semibold">Klaim Saya</h3>
            <p className="mt-1 text-sm text-muted">
              Lihat status klaim yang Anda ajukan.
            </p>
          </Link>
          <Link href="/profile" className="card-surface hover:border-primary">
            <p className="font-mono text-sm text-accent">$ profile --edit</p>
            <h3 className="mt-2 font-semibold">Profil Saya</h3>
            <p className="mt-1 text-sm text-muted">
              Perbarui data diri dan informasi kontak Anda.
            </p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
