import Link from 'next/link';
import {
  ITEM_CATEGORY_LABELS,
  type ItemCategory,
  type ItemStatus,
} from '@amtehi/shared';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/lib/utils';

interface ItemCardProps {
  id: string;
  type: 'lost' | 'found';
  title: string;
  description: string | null;
  category: ItemCategory;
  status: ItemStatus;
  location: string | null;
  date: string | null;
  photoUrl: string | null;
}

const borderByStatus: Record<ItemStatus, string> = {
  open: 'border-l-[var(--color-open)]',
  claimed: 'border-l-[var(--color-claimed)]',
  closed: 'border-l-[var(--color-closed)]',
};

/** Kartu item dengan border kiri berwarna sesuai status. */
export function ItemCard({
  id,
  type,
  title,
  description,
  category,
  status,
  location,
  date,
  photoUrl,
}: ItemCardProps) {
  return (
    <Link
      href={`/items/${type}/${id}`}
      className={`card-surface flex flex-col gap-2 border-l-4 ${borderByStatus[status]} transition-colors hover:border-primary`}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={title}
          className="mb-2 h-40 w-full rounded object-cover"
        />
      ) : (
        <div className="mb-2 flex h-40 w-full items-center justify-center rounded bg-bg font-mono text-muted">
          no_image
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 font-mono text-base font-semibold">
          {title}
        </h3>
        <StatusBadge status={status} />
      </div>

      {description && (
        <p className="line-clamp-2 text-sm text-muted">{description}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted">
        <span className="rounded border border-accent px-1.5 py-0.5 text-accent">
          {ITEM_CATEGORY_LABELS[category]}
        </span>
        {location && <span>📍 {location}</span>}
        <span className="ml-auto">{formatDate(date)}</span>
      </div>
    </Link>
  );
}
