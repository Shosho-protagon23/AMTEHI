'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ItemType } from '@amtehi/shared';
import { useDeleteItem } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api';

/**
 * Aksi moderasi admin pada halaman detail item: hapus laporan dengan alasan.
 * Hanya dirender bila user login berrole admin. Setelah hapus, kembali ke list.
 */
export function AdminItemActions({
  type,
  itemId,
}: {
  type: ItemType;
  itemId: string;
}) {
  const router = useRouter();
  const role = useAuth((s) => s.user?.role);
  const deleteItem = useDeleteItem();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (role !== 'admin') return null;

  async function handleDelete() {
    setError(null);
    if (reason.trim().length < 5) {
      setError('Alasan penghapusan minimal 5 karakter.');
      return;
    }
    try {
      await deleteItem.mutateAsync({
        id: itemId,
        input: { itemType: type, reason: reason.trim() },
      });
      router.push(`/items/${type}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="mt-2 rounded border border-danger/40 bg-danger/5 p-3">
      <p className="font-mono text-xs text-danger">$ admin --moderasi</p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-2 w-full rounded border border-danger px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          Hapus Laporan Ini
        </button>
      ) : (
        <div className="mt-2 space-y-2">
          {error && (
            <p className="rounded border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="input-field min-h-16 resize-y text-sm"
            placeholder="Alasan penghapusan (wajib, min. 5 karakter)..."
            disabled={deleteItem.isPending}
          />
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="flex-1 rounded border border-danger px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
            >
              {deleteItem.isPending ? '...' : 'Konfirmasi Hapus'}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setReason('');
                setError(null);
              }}
              disabled={deleteItem.isPending}
              className="flex-1 rounded border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-text disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
