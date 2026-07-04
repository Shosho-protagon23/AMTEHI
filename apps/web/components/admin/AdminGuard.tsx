'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAuth } from '@/hooks/use-auth';

/**
 * Proteksi halaman admin di sisi klien: hanya user dengan role 'admin'.
 * Pengecekan utama tetap di backend (middleware requireAdmin) — ini lapisan UX.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void fetchMe().finally(() => setChecked(true));
  }, [fetchMe]);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {!checked ? (
          <p className="font-mono text-sm text-muted">$ memeriksa akses...</p>
        ) : isAdmin ? (
          children
        ) : (
          <div className="card-surface mx-auto max-w-md text-center">
            <p className="font-mono text-sm text-danger">! 403 forbidden</p>
            <h1 className="mt-2 text-xl font-bold">Akses Khusus Admin</h1>
            <p className="mt-2 text-sm text-muted">
              Halaman ini hanya dapat diakses oleh admin kampus.
            </p>
            <Link href="/" className="btn-primary mt-4 inline-block">
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
