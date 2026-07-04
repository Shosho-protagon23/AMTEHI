'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ItemType } from '@amtehi/shared';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ItemForm } from '@/components/items/ItemForm';
import { useAuth } from '@/hooks/use-auth';

/**
 * Halaman form lapor barang dengan proteksi auth di sisi klien.
 * Jika belum login, tampilkan ajakan masuk alih-alih form.
 */
export function NewItemPage({ type }: { type: ItemType }) {
  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Pastikan sesi diperiksa sekali saat halaman dibuka
    void fetchMe().finally(() => setChecked(true));
  }, [fetchMe]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {!checked ? (
          <p className="font-mono text-sm text-muted">$ memeriksa sesi...</p>
        ) : user ? (
          <ItemForm type={type} />
        ) : (
          <div className="card-surface mx-auto max-w-md text-center">
            <p className="font-mono text-sm text-danger">! akses ditolak</p>
            <h1 className="mt-2 text-xl font-bold">Perlu Masuk Dulu</h1>
            <p className="mt-2 text-sm text-muted">
              Anda harus masuk untuk dapat melaporkan barang.
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
