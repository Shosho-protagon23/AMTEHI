'use client';

import { useState } from 'react';
import type { UserProfile, UserRole } from '@amtehi/shared';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { useUpdateUserRole, useUsers } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Mahasiswa',
  staff: 'Staf',
  admin: 'Admin',
};

const roleBadgeClass: Record<UserRole, string> = {
  student: 'border-secondary text-secondary',
  staff: 'border-accent text-accent',
  admin: 'border-primary text-primary',
};

/** Kontrol ubah role untuk satu user. Admin & diri sendiri tidak bisa diubah. */
function RoleControl({
  user,
  isSelf,
}: {
  user: UserProfile;
  isSelf: boolean;
}) {
  const updateRole = useUpdateUserRole();
  const [error, setError] = useState<string | null>(null);

  // Role admin dikelola lewat seed/DB, bukan panel. Diri sendiri juga dikunci.
  if (user.role === 'admin' || isSelf) {
    return <span className="font-mono text-xs text-muted">terkunci</span>;
  }

  async function handleChange(role: 'student' | 'staff') {
    if (role === user.role) return;
    setError(null);
    try {
      await updateRole.mutateAsync({ id: user.id, input: { role } });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-1">
      <select
        value={user.role}
        onChange={(e) => handleChange(e.target.value as 'student' | 'staff')}
        disabled={updateRole.isPending}
        className="input-field w-32 py-1 text-xs"
      >
        <option value="student">Mahasiswa</option>
        <option value="staff">Staf</option>
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function UsersContent() {
  const { data: users, isLoading, isError } = useUsers();
  const currentUser = useAuth((s) => s.user);

  if (isLoading) {
    return <p className="font-mono text-sm text-muted">$ memuat user...</p>;
  }
  if (isError || !users) {
    return (
      <p className="font-mono text-sm text-danger">
        ! gagal memuat user. Pastikan API berjalan.
      </p>
    );
  }
  if (users.length === 0) {
    return <p className="font-mono text-sm text-muted"># belum ada user.</p>;
  }

  return (
    <div className="card-surface overflow-x-auto p-0">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border font-mono text-xs text-muted">
          <tr>
            <th className="px-4 py-3">Nama</th>
            <th className="px-4 py-3">NIM</th>
            <th className="px-4 py-3">Fakultas</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Bergabung</th>
            <th className="px-4 py-3">Ubah Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border/50 last:border-0">
              <td className="px-4 py-3 font-medium">{u.fullName}</td>
              <td className="px-4 py-3 font-mono text-muted">{u.nim ?? '-'}</td>
              <td className="px-4 py-3 text-muted">{u.faculty ?? '-'}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded border px-2 py-0.5 text-xs ${roleBadgeClass[u.role]}`}
                >
                  {ROLE_LABELS[u.role]}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3">
                <RoleControl user={u} isSelf={u.id === currentUser?.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <header className="mb-6">
        <p className="font-mono text-sm text-secondary">$ amtehi admin --users</p>
        <h1 className="mt-2 text-2xl font-bold">Kelola User</h1>
        <p className="mt-1 text-muted">Daftar seluruh user terdaftar di AMTEHI.</p>
      </header>
      <UsersContent />
    </AdminGuard>
  );
}
