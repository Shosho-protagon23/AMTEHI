'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

/** Navbar atas dengan branding terminal, reaktif terhadap status login. */
export function Navbar() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    if (!user) void fetchMe();
  }, [user, fetchMe]);

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-mono text-lg">
          <span className="text-primary">~/</span>
          <span className="font-bold text-text">AMTEHI</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/items/lost" className="text-muted hover:text-text">
            Barang Hilang
          </Link>
          <Link href="/items/found" className="text-muted hover:text-text">
            Barang Temuan
          </Link>

          {user?.role === 'admin' && (
            <Link href="/admin" className="text-accent hover:text-text">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link href="/dashboard" className="text-muted hover:text-text">
                Dashboard
              </Link>
              <Link href="/profile" className="text-muted hover:text-text">
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="btn-ghost px-3 py-1.5 text-sm"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-3 py-1.5 text-sm">
                Masuk
              </Link>
              <Link href="/register" className="btn-primary px-3 py-1.5 text-sm">
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
