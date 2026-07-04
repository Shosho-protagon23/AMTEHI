'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ItemType } from '@amtehi/shared';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ClaimForm } from '@/components/claims/ClaimForm';
import { useAuth } from '@/hooks/use-auth';

/**
 * Halaman ajukan klaim dengan proteksi auth di sisi klien.
 * Pola mengikuti NewItemPage: cek sesi sekali saat dibuka.
 */
export function ClaimPage({ type, itemId }: { type: ItemType; itemId: string }) {
  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void fetchMe().finally(() => setChecked(true));
  }, [fetchMe]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {!checked ? (
          <p className="font-mono text-sm text-muted">$ memeriksa sesi...</p>
        ) : user ? (
          <ClaimForm type={type} itemId={itemId} />
        ) : (
          <div className="card-surface mx-auto max-w-md text-center">
            <p className="font-mono text-sm text-danger">! akses ditolak</p>
            <h1 className="mt-2 text-xl font-bold">Perlu Masuk Dulu</h1>
            <p className="mt-2 text-sm text-muted">
              Anda harus masuk untuk dapat mengajukan klaim.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link href="/login" className="btn-primary">
                Masuk
              </Link>
              <Link href="/register" className="btn-ghost">
                Daftar
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
