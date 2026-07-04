'use client';

import { useState } from 'react';
import {
  CLAIM_STATUSES,
  CLAIM_STATUS_LABELS,
  type ClaimStatus,
} from '@amtehi/shared';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { ClaimReviewCard } from '@/components/admin/ClaimReviewCard';
import { useAllClaims } from '@/hooks/use-admin';

type Filter = ClaimStatus | 'all';

function ClaimsContent() {
  const [filter, setFilter] = useState<Filter>('pending');
  const { data: claims, isLoading, isError } = useAllClaims(
    filter === 'all' ? undefined : filter,
  );

  const filters: { value: Filter; label: string }[] = [
    { value: 'pending', label: CLAIM_STATUS_LABELS.pending },
    { value: 'approved', label: CLAIM_STATUS_LABELS.approved },
    { value: 'rejected', label: CLAIM_STATUS_LABELS.rejected },
    { value: 'all', label: 'Semua' },
  ];

  return (
    <div className="space-y-6">
      {/* Filter status */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded border px-3 py-1.5 text-sm transition-colors ${
              filter === f.value
                ? 'border-primary text-primary'
                : 'border-border text-muted hover:text-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="font-mono text-sm text-muted">$ memuat klaim...</p>
      )}
      {isError && (
        <p className="font-mono text-sm text-danger">
          ! gagal memuat klaim. Pastikan API berjalan.
        </p>
      )}
      {claims && claims.length === 0 && (
        <p className="font-mono text-sm text-muted"># tidak ada klaim.</p>
      )}

      {claims && claims.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {claims.map((claim) => (
            <ClaimReviewCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminClaimsPage() {
  return (
    <AdminGuard>
      <header className="mb-6">
        <p className="font-mono text-sm text-secondary">$ amtehi admin --claims</p>
        <h1 className="mt-2 text-2xl font-bold">Review Klaim</h1>
        <p className="mt-1 text-muted">
          Verifikasi klaim kepemilikan barang dari user.
        </p>
      </header>
      <ClaimsContent />
    </AdminGuard>
  );
}
