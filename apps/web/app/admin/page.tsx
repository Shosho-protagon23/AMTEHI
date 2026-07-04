'use client';

import Link from 'next/link';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { useStats } from '@/hooks/use-admin';

/** Kartu angka statistik sederhana. */
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="card-surface">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 font-mono text-3xl font-bold ${accent ?? 'text-text'}`}>
        {value}
      </p>
    </div>
  );
}

function StatsContent() {
  const { data: stats, isLoading, isError } = useStats();

  if (isLoading) {
    return <p className="font-mono text-sm text-muted">$ memuat statistik...</p>;
  }
  if (isError || !stats) {
    return (
      <p className="font-mono text-sm text-danger">
        ! gagal memuat statistik. Pastikan API berjalan.
      </p>
    );
  }

  const totalLost =
    stats.lostItems.open + stats.lostItems.claimed + stats.lostItems.closed;
  const totalFound =
    stats.foundItems.open + stats.foundItems.claimed + stats.foundItems.closed;

  return (
    <div className="space-y-8">
      {/* Ringkasan utama */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Klaim menunggu review"
          value={stats.pendingClaims}
          accent="text-accent"
        />
        <StatCard label="Total user" value={stats.totalUsers} accent="text-secondary" />
        <StatCard label="Total barang hilang" value={totalLost} />
        <StatCard label="Total barang temuan" value={totalFound} />
      </div>

      {/* Rincian status item */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-surface">
          <h3 className="mb-3 font-mono font-semibold">Barang Hilang</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Terbuka</dt>
              <dd className="font-mono text-[var(--color-open)]">{stats.lostItems.open}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Diklaim</dt>
              <dd className="font-mono text-[var(--color-claimed)]">{stats.lostItems.claimed}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Ditutup</dt>
              <dd className="font-mono text-muted">{stats.lostItems.closed}</dd>
            </div>
          </dl>
        </div>

        <div className="card-surface">
          <h3 className="mb-3 font-mono font-semibold">Barang Temuan</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Terbuka</dt>
              <dd className="font-mono text-[var(--color-open)]">{stats.foundItems.open}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Diklaim</dt>
              <dd className="font-mono text-[var(--color-claimed)]">{stats.foundItems.claimed}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Ditutup</dt>
              <dd className="font-mono text-muted">{stats.foundItems.closed}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Navigasi cepat */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/claims" className="card-surface hover:border-primary">
          <p className="font-mono text-sm text-accent">$ review --claims</p>
          <h3 className="mt-2 font-semibold">Review Klaim</h3>
          <p className="mt-1 text-sm text-muted">
            Setujui atau tolak klaim yang masuk.
          </p>
        </Link>
        <Link href="/admin/users" className="card-surface hover:border-primary">
          <p className="font-mono text-sm text-secondary">$ ls --users</p>
          <h3 className="mt-2 font-semibold">Kelola User</h3>
          <p className="mt-1 text-sm text-muted">
            Lihat daftar user & ubah role.
          </p>
        </Link>
        <Link href="/admin/logs" className="card-surface hover:border-primary">
          <p className="font-mono text-sm text-primary">$ tail -f audit.log</p>
          <h3 className="mt-2 font-semibold">Log Aktivitas</h3>
          <p className="mt-1 text-sm text-muted">Jejak audit aksi admin.</p>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <header className="mb-6">
        <p className="font-mono text-sm text-secondary">$ amtehi admin --dashboard</p>
        <h1 className="mt-2 text-2xl font-bold">Panel Admin</h1>
        <p className="mt-1 text-muted">
          Statistik & manajemen platform AMTEHI.
        </p>
      </header>
      <StatsContent />
    </AdminGuard>
  );
}
