'use client';

import Link from 'next/link';
import {
  ITEM_CATEGORY_LABELS,
  type ItemType,
  type LostItem,
  type FoundItem,
} from '@amtehi/shared';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { StatusBadge } from '@/components/items/StatusBadge';
import { AdminItemActions } from '@/components/admin/AdminItemActions';
import { useItemDetail } from '@/hooks/use-items';
import { formatDateTime } from '@/lib/utils';

/**
 * Halaman detail satu item (lost/found), reusable untuk kedua tipe.
 * Field lokasi & tanggal menyesuaikan tipe item.
 */
export function ItemDetail({ type, id }: { type: ItemType; id: string }) {
  const { data: item, isLoading, isError } = useItemDetail(type, id);

  const isLost = type === 'lost';
  const lost = item as LostItem | undefined;
  const found = item as FoundItem | undefined;

  const location = isLost ? lost?.lastSeenLoc : found?.foundLoc;
  const eventDate = isLost ? lost?.lastSeenAt : found?.foundAt;
  const locationLabel = isLost ? 'Terakhir terlihat' : 'Lokasi ditemukan';
  const dateLabel = isLost ? 'Waktu terakhir terlihat' : 'Waktu ditemukan';
  const backHref = `/items/${type}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <Link
          href={backHref}
          className="font-mono text-sm text-secondary hover:text-primary"
        >
          $ cd ../{isLost ? 'barang-hilang' : 'barang-temuan'}
        </Link>

        {isLoading && (
          <p className="mt-6 font-mono text-sm text-muted">$ memuat data...</p>
        )}

        {isError && (
          <p className="mt-6 font-mono text-sm text-danger">
            ! item tidak ditemukan atau API tidak berjalan.
          </p>
        )}

        {item && (
          <article className="mt-6 grid gap-8 md:grid-cols-2">
            {/* Foto */}
            <div>
              {item.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  className="w-full rounded-lg border border-border object-cover"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center rounded-lg border border-border bg-bg font-mono text-muted">
                  no_image
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-mono text-2xl font-bold">{item.title}</h1>
                <StatusBadge status={item.status} />
              </div>

              <span className="w-fit rounded border border-accent px-2 py-0.5 text-xs text-accent">
                {ITEM_CATEGORY_LABELS[item.category]}
              </span>

              {item.description && (
                <p className="whitespace-pre-line text-sm text-text">
                  {item.description}
                </p>
              )}

              <dl className="grid grid-cols-1 gap-3 border-t border-border pt-4 text-sm">
                <div>
                  <dt className="text-muted">{locationLabel}</dt>
                  <dd className="font-mono">{location || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted">{dateLabel}</dt>
                  <dd className="font-mono">{formatDateTime(eventDate)}</dd>
                </div>
                {!isLost && found?.storageLoc && (
                  <div>
                    <dt className="text-muted">Disimpan di</dt>
                    <dd className="font-mono">{found.storageLoc}</dd>
                  </div>
                )}
                {item.owner && (
                  <div>
                    <dt className="text-muted">
                      {isLost ? 'Dilaporkan oleh' : 'Ditemukan oleh'}
                    </dt>
                    <dd className="font-mono">{item.owner.fullName}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted">Dilaporkan pada</dt>
                  <dd className="font-mono">{formatDateTime(item.createdAt)}</dd>
                </div>
              </dl>

              {/* Aksi klaim — hanya untuk item yang masih terbuka */}
              {item.status === 'open' && (
                <Link
                  href={`/items/${type}/${item.id}/claim`}
                  className="btn-primary mt-2 w-full text-center"
                >
                  Ajukan Klaim
                </Link>
              )}

              {/* Aksi moderasi — hanya tampil untuk admin */}
              <AdminItemActions type={type} itemId={item.id} />
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
