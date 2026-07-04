'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CLAIM_STATUS_LABELS,
  type ClaimStatus,
  type ClaimRequest,
} from '@amtehi/shared';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAuth } from '@/hooks/use-auth';
import { useMyClaims } from '@/hooks/use-claims';
import { formatDateTime } from '@/lib/utils';

/** Warna border badge status klaim mengikuti tema terminal. */
const claimBadgeClass: Record<ClaimStatus, string> = {
  pending: 'border-accent text-accent',
  approved: 'border-success text-success',
  rejected: 'border-danger text-danger',
};

function ClaimRow({ claim }: { claim: ClaimRequest }) {
  return (
    <Link
      href={`/items/${claim.itemType}/${claim.itemId}`}
      className="card-surface flex flex-col gap-2 transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-sm text-secondary">
          {claim.itemType === 'lost' ? 'barang hilang' : 'barang temuan'}
        </span>
        <span
          className={`rounded border px-2 py-0.5 text-xs ${claimBadgeClass[claim.status]}`}
        >
          {CLAIM_STATUS_LABELS[claim.status]}
        </span>
      </div>

      {claim.proofText && (
        <p className="line-clamp-2 text-sm text-text">{claim.proofText}</p>
      )}

      {claim.adminNote && (
        <p className="text-sm text-muted">
          <span className="text-muted">Catatan admin:</span> {claim.adminNote}
        </p>
      )}

      <span className="mt-auto pt-1 text-xs text-muted">
        Diajukan {formatDateTime(claim.createdAt)}
      </span>
    </Link>
  );
}

export default function MyClaimsPage() {
  const user = useAuth((s) => s.user);
  const fetchMe = useAuth((s) => s.fetchMe);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void fetchMe().finally(() => setChecked(true));
  }, [fetchMe]);

  const { data: claims, isLoading, isError } = useMyClaims();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <header className="mb-6">
          <p className="font-mono text-sm text-secondary">$ amtehi claim --list</p>
          <h1 className="mt-2 text-2xl font-bold">Klaim Saya</h1>
          <p className="mt-1 text-muted">
            Daftar klaim yang Anda ajukan beserta statusnya.
          </p>
        </header>

        {checked && !user && (
          <div className="card-surface text-center">
            <p className="font-mono text-sm text-danger">! akses ditolak</p>
            <p className="mt-2 text-sm text-muted">
              Anda harus masuk untuk melihat klaim.
            </p>
            <Link href="/login" className="btn-primary mt-4 inline-block">
              Masuk
            </Link>
          </div>
        )}

        {user && isLoading && (
          <p className="font-mono text-sm text-muted">$ memuat data...</p>
        )}
        {user && isError && (
          <p className="font-mono text-sm text-danger">
            ! gagal memuat klaim. Pastikan API berjalan.
          </p>
        )}
        {user && claims && claims.length === 0 && (
          <p className="font-mono text-sm text-muted">
            # Anda belum mengajukan klaim apa pun.
          </p>
        )}

        {user && claims && claims.length > 0 && (
          <div className="space-y-4">
            {claims.map((claim) => (
              <ClaimRow key={claim.id} claim={claim} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
