'use client';

import { useState } from 'react';
import {
  ADMIN_ACTION_LABELS,
  type AdminAction,
} from '@amtehi/shared';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { useAdminLogs } from '@/hooks/use-admin';
import { formatDateTime } from '@/lib/utils';

type Filter = AdminAction | 'all';

const actionBadgeClass: Record<AdminAction, string> = {
  review_claim: 'border-secondary text-secondary',
  delete_item: 'border-danger text-danger',
  update_role: 'border-accent text-accent',
};

function LogsContent() {
  const [filter, setFilter] = useState<Filter>('all');
  const { data: logs, isLoading, isError } = useAdminLogs(
    filter === 'all' ? undefined : filter,
  );

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'review_claim', label: ADMIN_ACTION_LABELS.review_claim },
    { value: 'delete_item', label: ADMIN_ACTION_LABELS.delete_item },
    { value: 'update_role', label: ADMIN_ACTION_LABELS.update_role },
  ];

  return (
    <div className="space-y-6">
      {/* Filter action */}
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
        <p className="font-mono text-sm text-muted">$ memuat log...</p>
      )}
      {isError && (
        <p className="font-mono text-sm text-danger">
          ! gagal memuat log. Pastikan API berjalan.
        </p>
      )}
      {logs && logs.length === 0 && (
        <p className="font-mono text-sm text-muted"># belum ada aktivitas.</p>
      )}

      {logs && logs.length > 0 && (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="card-surface">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded border px-2 py-0.5 text-xs ${actionBadgeClass[log.action]}`}
                    >
                      {ADMIN_ACTION_LABELS[log.action]}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {log.admin?.fullName ?? 'admin'}
                    </span>
                  </div>
                  {log.detail && (
                    <p className="mt-2 text-sm text-text">{log.detail}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminLogsPage() {
  return (
    <AdminGuard>
      <header className="mb-6">
        <p className="font-mono text-sm text-secondary">$ amtehi admin --logs</p>
        <h1 className="mt-2 text-2xl font-bold">Log Aktivitas</h1>
        <p className="mt-1 text-muted">
          Jejak audit seluruh aksi admin di platform AMTEHI.
        </p>
      </header>
      <LogsContent />
    </AdminGuard>
  );
}
