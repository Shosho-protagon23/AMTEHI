import { ITEM_STATUS_LABELS, type ItemStatus } from '@amtehi/shared';
import { cn } from '@/lib/utils';

const statusClass: Record<ItemStatus, string> = {
  open: 'badge-open',
  claimed: 'badge-claimed',
  closed: 'badge-closed',
};

/** Badge status item dengan border berwarna sesuai design system. */
export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span className={cn('badge-status', statusClass[status])}>
      {ITEM_STATUS_LABELS[status]}
    </span>
  );
}
