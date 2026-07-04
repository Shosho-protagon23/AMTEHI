'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerSchema } from '@amtehi/shared';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const isLoading = useAuth((s) => s.isLoading);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    nim: '',
    faculty: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = registerSchema.safeParse({
      ...form,
      nim: form.nim || undefined,
      faculty: form.faculty || undefined,
      phone: form.phone || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Input tidak valid');
      return;
    }
    try {
      await register(parsed.data);
      router.push('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card-surface w-full max-w-md">
        <p className="font-mono text-sm text-success">$ amtehi register</p>
        <h1 className="mt-2 text-2xl font-bold">Daftar Akun</h1>
        <p className="mt-1 text-sm text-muted">
          Buat akun untuk melaporkan & mengklaim barang.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm text-muted">Nama Lengkap</label>
            <input
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              className="input-field"
              placeholder="Nama lengkap Anda"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input-field"
              placeholder="nama@students.amikom.ac.id"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="input-field"
              placeholder="Minimal 8 karakter"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted">NIM (opsional)</label>
              <input
                value={form.nim}
                onChange={(e) => update('nim', e.target.value)}
                className="input-field"
                placeholder="NIM"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">
                No. HP (opsional)
              </label>
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="input-field"
                placeholder="08xxxx"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">
              Fakultas (opsional)
            </label>
            <input
              value={form.faculty}
              onChange={(e) => update('faculty', e.target.value)}
              className="input-field"
              placeholder="mis. Ilmu Komputer"
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-secondary hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
