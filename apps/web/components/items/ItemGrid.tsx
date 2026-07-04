'use client';

import { useState } from 'react';
import {
  ITEM_CATEGORIES,
  ITEM_CATEGORY_LABELS,
  ITEM_STATUSES,
  ITEM_STATUS_LABELS,
  type ItemType,
  type LostItem,
  type FoundItem,
} from '@amtehi/shared';
import { useItems } from '@/hooks/use-items';
import { ItemCard } from './ItemCard';

/**
 * Grid item dengan kontrol pencarian + filter, dipakai halaman lost & found.
 */
export function ItemGrid({ type }: { type: ItemType }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, isError } = useItems(type, {
    q: q || undefined,
    category: category || undefined,
    status: status || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="card-surface flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Cari judul atau deskripsi..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input-field flex-1"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">Semua Kategori</option>
          {ITEM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {ITEM_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field sm:w-40"
        >
          <option value="">Semua Status</option>
          {ITEM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ITEM_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Hasil */}
      {isLoading && (
        <p className="font-mono text-sm text-muted">$ memuat data...</p>
      )}
      {isError && (
        <p className="font-mono text-sm text-danger">
          ! gagal memuat data. Pastikan API berjalan.
        </p>
      )}

      {data && data.items.length === 0 && (
        <p className="font-mono text-sm text-muted">
          # tidak ada item yang cocok.
        </p>
      )}

      {data && data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item) => {
            const isLost = type === 'lost';
            const lost = item as LostItem;
            const found = item as FoundItem;
            return (
              <ItemCard
                key={item.id}
                id={item.id}
                type={type}
                title={item.title}
                description={item.description}
                category={item.category}
                status={item.status}
                location={isLost ? lost.lastSeenLoc : found.foundLoc}
                date={isLost ? lost.lastSeenAt : found.foundAt}
                photoUrl={item.photoUrl}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
