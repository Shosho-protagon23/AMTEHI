'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@amtehi/shared';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const isLoading = useAuth((s) => s.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Input tidak valid');
      return;
    }
    try {
      await login(parsed.data);
      router.push('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card-surface w-full max-w-md">
        <p className="font-mono text-sm text-success">$ amtehi login</p>
        <h1 className="mt-2 text-2xl font-bold">Masuk</h1>
        <p className="mt-1 text-sm text-muted">
          Gunakan akun kampus Amikom Anda.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm text-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="nama@students.amikom.ac.id"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Belum punya akun?{' '}
          <Link href="/register" className="text-secondary hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
