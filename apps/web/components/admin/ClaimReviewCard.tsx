'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CLAIM_STATUS_LABELS,
  type ClaimRequest,
  type ClaimStatus,
} from '@amtehi/shared';
import { useReviewClaim } from '@/hooks/use-admin';
import { getApiErrorMessage } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

const claimBadgeClass: Record<ClaimStatus, string> = {
  pending: 'border-accent text-accent',
  approved: 'border-success text-success',
  rejected: 'border-danger text-danger',
};

/**
 * Kartu klaim untuk admin: menampilkan bukti & memungkinkan approve/reject
 * dengan catatan. Tombol aksi hanya muncul untuk klaim berstatus 'pending'.
 */
export function ClaimReviewCard({ claim }: { claim: ClaimRequest }) {
  const reviewClaim = useReviewClaim();
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isPending = claim.status === 'pending';

  async function handleReview(status: 'approved' | 'rejected') {
    setError(null);
    try {
      await reviewClaim.mutateAsync({
        id: claim.id,
        input: { status, adminNote: adminNote || undefined },
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="card-surface space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-secondary">
            {claim.itemType === 'lost' ? 'barang hilang' : 'barang temuan'}
          </p>
          {claim.claimant && (
            <p className="mt-1 text-sm">
              <span className="text-muted">Pengklaim:</span>{' '}
              <span className="font-mono">{claim.claimant.fullName}</span>
            </p>
          )}
        </div>
        <span
          className={`rounded border px-2 py-0.5 text-xs ${claimBadgeClass[claim.status]}`}
        >
          {CLAIM_STATUS_LABELS[claim.status]}
        </span>
      </div>

      {claim.proofText && (
        <div>
          <p className="text-xs text-muted">Bukti kepemilikan:</p>
          <p className="whitespace-pre-line text-sm text-text">{claim.proofText}</p>
        </div>
      )}

      {claim.proofPhotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={claim.proofPhotoUrl}
          alt="Foto bukti"
          className="max-h-48 rounded border border-border object-cover"
        />
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span>Diajukan {formatDateTime(claim.createdAt)}</span>
        <Link
          href={`/items/${claim.itemType}/${claim.itemId}`}
          className="text-secondary hover:text-primary"
        >
          Lihat barang →
        </Link>
      </div>

      {/* Catatan admin yang sudah ada (klaim terreview) */}
      {!isPending && claim.adminNote && (
        <p className="rounded border border-border bg-bg px-3 py-2 text-sm">
          <span className="text-muted">Catatan: </span>
          {claim.adminNote}
        </p>
      )}

      {/* Form aksi — hanya untuk klaim pending */}
      {isPending && (
        <div className="space-y-2 border-t border-border pt-3">
          {error && (
            <p className="rounded border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="input-field min-h-16 resize-y text-sm"
            placeholder="Catatan untuk pengklaim (opsional)..."
            disabled={reviewClaim.isPending}
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleReview('approved')}
              disabled={reviewClaim.isPending}
              className="flex-1 rounded border border-success px-3 py-2 text-sm font-medium text-success transition-colors hover:bg-success/10 disabled:opacity-50"
            >
              {reviewClaim.isPending ? '...' : 'Setujui'}
            </button>
            <button
              onClick={() => handleReview('rejected')}
              disabled={reviewClaim.isPending}
              className="flex-1 rounded border border-danger px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
            >
              {reviewClaim.isPending ? '...' : 'Tolak'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
