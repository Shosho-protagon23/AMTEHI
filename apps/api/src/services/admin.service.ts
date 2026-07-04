import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { mapProfile, mapAdminLog } from './mappers.js';
import type {
  AdminAction,
  UpdateUserRoleInput,
  DeleteItemInput,
} from '@amtehi/shared';

const adminSelect = {
  admin: { select: { id: true, fullName: true, avatarUrl: true } },
} as const;

/**
 * Catat aksi admin ke audit trail (admin_logs).
 * Bisa dijalankan di dalam transaksi dengan mengoper `tx`.
 */
export async function logAction(
  adminId: string,
  action: AdminAction,
  opts: { targetType?: string; targetId?: string; detail?: string } = {},
  tx: Prisma.TransactionClient = prisma,
): Promise<void> {
  await tx.adminLog.create({
    data: {
      adminId,
      action,
      targetType: opts.targetType ?? null,
      targetId: opts.targetId ?? null,
      detail: opts.detail ?? null,
    },
  });
}

/**
 * Ubah role user (student ↔ staff). Role 'admin' tidak bisa di-set lewat sini
 * (dicegah di schema Zod) untuk menghindari eskalasi hak akses via UI.
 * Admin juga tidak boleh menurunkan role dirinya sendiri.
 */
export async function updateUserRole(
  adminId: string,
  targetUserId: string,
  input: UpdateUserRoleInput,
) {
  if (targetUserId === adminId) {
    throw AppError.badRequest(
      'Anda tidak dapat mengubah role akun Anda sendiri',
      'CANNOT_CHANGE_OWN_ROLE',
    );
  }

  const target = await prisma.profile.findUnique({
    where: { id: targetUserId },
    select: { role: true },
  });
  if (!target) throw AppError.notFound('User tidak ditemukan', 'USER_NOT_FOUND');

  if (target.role === 'admin') {
    throw AppError.forbidden(
      'Role admin tidak dapat diubah melalui panel',
      'CANNOT_DEMOTE_ADMIN',
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.update({
      where: { id: targetUserId },
      data: { role: input.role },
    });
    await logAction(
      adminId,
      'update_role',
      {
        targetType: 'user',
        targetId: targetUserId,
        detail: `Role diubah dari '${target.role}' menjadi '${input.role}'`,
      },
      tx,
    );
    return profile;
  });

  return mapProfile(updated);
}

/**
 * Hapus laporan barang (moderasi admin). Mencatat alasan ke audit trail.
 * Klaim terkait ikut terhapus manual karena tidak ada FK DB antara item & klaim.
 */
export async function deleteItem(
  adminId: string,
  itemId: string,
  input: DeleteItemInput,
) {
  const item =
    input.itemType === 'lost'
      ? await prisma.lostItem.findUnique({
          where: { id: itemId },
          select: { id: true, title: true },
        })
      : await prisma.foundItem.findUnique({
          where: { id: itemId },
          select: { id: true, title: true },
        });

  if (!item) throw AppError.notFound('Barang tidak ditemukan', 'ITEM_NOT_FOUND');

  await prisma.$transaction(async (tx) => {
    // Bersihkan klaim yang menunjuk item ini (tidak ada FK, jadi manual).
    await tx.claimRequest.deleteMany({
      where: { itemId, itemType: input.itemType },
    });

    if (input.itemType === 'lost') {
      await tx.lostItem.delete({ where: { id: itemId } });
    } else {
      await tx.foundItem.delete({ where: { id: itemId } });
    }

    await logAction(
      adminId,
      'delete_item',
      {
        targetType: input.itemType,
        targetId: itemId,
        detail: `Hapus "${item.title}". Alasan: ${input.reason}`,
      },
      tx,
    );
  });
}

/** Daftar audit log admin (terbaru dulu), opsional filter action. */
export async function listLogs(action?: AdminAction) {
  const logs = await prisma.adminLog.findMany({
    where: action ? { action } : undefined,
    include: adminSelect,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return logs.map(mapAdminLog);
}
