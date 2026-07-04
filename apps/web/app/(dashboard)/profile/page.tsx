'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfileSchema } from '@amtehi/shared';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api';

/** Halaman edit profil pengguna — sinkron dengan store auth global. */
export default function ProfilePage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);
  const updateProfile = useAuth((s) => s.updateProfile);
  const isLoading = useAuth((s) => s.isLoading);

  const [form, setForm] = useState({
    fullName: '',
    nim: '',
    faculty: '',
    phone: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Tandai kapan profil sudah dimuat ke form agar tidak menimpa input pengguna
  const [hydrated, setHydrated] = useState(false);

  // Ambil profil bila store kosong (mis. setelah reload)
  useEffect(() => {
    if (!user) void fetchMe();
  }, [user, fetchMe]);

  // Isi form dari data profil sekali saat tersedia
  useEffect(() => {
    if (user && !hydrated) {
      setForm({
        fullName: user.fullName ?? '',
        nim: user.nim ?? '',
        faculty: user.faculty ?? '',
        phone: user.phone ?? '',
      });
      setHydrated(true);
    }
  }, [user, hydrated]);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Kirim string apa adanya: field opsional yang dikosongkan akan
    // diubah menjadi null oleh schema sehingga datanya terhapus di DB.
    const parsed = updateProfileSchema.safeParse({
      fullName: form.fullName || undefined,
      nim: form.nim,
      faculty: form.faculty,
      phone: form.phone,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Input tidak valid');
      return;
    }

    try {
      await updateProfile(parsed.data);
      setSuccess('Profil berhasil diperbarui.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <p className="font-mono text-sm text-secondary">$ profile --edit</p>
        <h1 className="mt-2 text-2xl font-bold">Profil Saya</h1>

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

        {user && (
          <div className="card-surface mt-6">
            {/* Info akun yang tidak bisa diubah dari sini */}
            <div className="mb-6 grid gap-3 border-b border-border pb-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Role</p>
                <p className="mt-0.5 font-mono text-sm text-accent">{user.role}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">
                  Bergabung
                </p>
                <p className="mt-0.5 font-mono text-sm text-text">
                  {new Date(user.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <p className="rounded border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded border border-success/50 bg-success/10 px-3 py-2 text-sm text-success">
                  {success}
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

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm text-muted">
                      NIM (opsional)
                    </label>
                    {form.nim && (
                      <button
                        type="button"
                        onClick={() => update('nim', '')}
                        className="font-mono text-xs text-danger hover:underline"
                      >
                        hapus
                      </button>
                    )}
                  </div>
                  <input
                    value={form.nim}
                    onChange={(e) => update('nim', e.target.value)}
                    className="input-field"
                    placeholder="NIM"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm text-muted">
                      No. HP (opsional)
                    </label>
                    {form.phone && (
                      <button
                        type="button"
                        onClick={() => update('phone', '')}
                        className="font-mono text-xs text-danger hover:underline"
                      >
                        hapus
                      </button>
                    )}
                  </div>
                  <input
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="input-field"
                    placeholder="08xxxx"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm text-muted">
                    Fakultas (opsional)
                  </label>
                  {form.faculty && (
                    <button
                      type="button"
                      onClick={() => update('faculty', '')}
                      className="font-mono text-xs text-danger hover:underline"
                    >
                      hapus
                    </button>
                  )}
                </div>
                <input
                  value={form.faculty}
                  onChange={(e) => update('faculty', e.target.value)}
                  className="input-field"
                  placeholder="mis. Ilmu Komputer"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
