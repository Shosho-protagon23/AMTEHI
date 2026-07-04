import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { mapClaim } from './mappers.js';
import { logAction } from './admin.service.js';
import type { CreateClaimInput, ReviewClaimInput } from '@amtehi/shared';

const claimantSelect = {
  claimant: { select: { id: true, fullName: true, avatarUrl: true } },
} as const;

/** Pastikan item yang diklaim benar-benar ada sesuai jenisnya. */
async function getItemOwnerId(
  itemType: 'lost' | 'found',
  itemId: string,
): Promise<string> {
  const item =
    itemType === 'lost'
      ? await prisma.lostItem.findUnique({ where: { id: itemId }, select: { userId: true } })
      : await prisma.foundItem.findUnique({ where: { id: itemId }, select: { userId: true } });
  if (!item) throw AppError.notFound('Barang yang diklaim tidak ditemukan', 'ITEM_NOT_FOUND');
  return item.userId;
}

/**
 * Ajukan klaim. Aturan bisnis:
 * - Item harus ada.
 * - Tidak boleh mengklaim barang milik sendiri.
 * - Tidak boleh ada klaim pending/approved ganda dari user yang sama untuk item yang sama.
 */
export async function createClaim(claimantId: string, input: CreateClaimInput) {
  const ownerId = await getItemOwnerId(input.itemType, input.itemId);

  if (ownerId === claimantId) {
    throw AppError.badRequest(
      'Anda tidak dapat mengklaim barang yang Anda laporkan sendiri',
      'CANNOT_CLAIM_OWN_ITEM',
    );
  }

  const existing = await prisma.claimRequest.findFirst({
    where: {
      claimantId,
      itemId: input.itemId,
      status: { in: ['pending', 'approved'] },
    },
    select: { id: true },
  });
  if (existing) {
    throw AppError.conflict(
      'Anda sudah mengajukan klaim untuk barang ini',
      'CLAIM_ALREADY_EXISTS',
    );
  }

  const claim = await prisma.claimRequest.create({
    data: {
      claimantId,
      itemId: input.itemId,
      itemType: input.itemType,
      proofText: input.proofText,
      proofPhotoUrl: input.proofPhotoUrl,
    },
    include: claimantSelect,
  });
  return mapClaim(claim);
}

/** Daftar klaim milik user (klaim yang ia ajukan). */
export async function listMyClaims(claimantId: string) {
  const claims = await prisma.claimRequest.findMany({
    where: { claimantId },
    include: claimantSelect,
    orderBy: { createdAt: 'desc' },
  });
  return claims.map(mapClaim);
}

/** Daftar semua klaim (admin), opsional filter status. */
export async function listAllClaims(status?: 'pending' | 'approved' | 'rejected') {
  const claims = await prisma.claimRequest.findMany({
    where: status ? { status } : undefined,
    include: claimantSelect,
    orderBy: { createdAt: 'desc' },
  });
  return claims.map(mapClaim);
}

/**
 * Review klaim (admin): approve/reject. Jika approve, set item terkait → 'claimed'.
 * Dijalankan dalam transaksi agar konsisten.
 */
export async function reviewClaim(
  claimId: string,
  reviewerId: string,
  input: ReviewClaimInput,
) {
  const claim = await prisma.claimRequest.findUnique({ where: { id: claimId } });
  if (!claim) throw AppError.notFound('Klaim tidak ditemukan', 'CLAIM_NOT_FOUND');
  if (claim.status !== 'pending') {
    throw AppError.conflict('Klaim ini sudah pernah direview', 'CLAIM_ALREADY_REVIEWED');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const reviewed = await tx.claimRequest.update({
      where: { id: claimId },
      data: {
        status: input.status,
        adminNote: input.adminNote,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
      include: claimantSelect,
    });

    if (input.status === 'approved') {
      if (claim.itemType === 'lost') {
        await tx.lostItem.update({
          where: { id: claim.itemId },
          data: { status: 'claimed' },
        });
      } else {
        await tx.foundItem.update({
          where: { id: claim.itemId },
          data: { status: 'claimed' },
        });
      }
    }

    // Catat aksi review ke audit trail
    await logAction(
      reviewerId,
      'review_claim',
      {
        targetType: 'claim',
        targetId: claimId,
        detail: `Klaim ${input.status === 'approved' ? 'disetujui' : 'ditolak'}${
          input.adminNote ? `. Catatan: ${input.adminNote}` : ''
        }`,
      },
      tx,
    );

    return reviewed;
  });

  return mapClaim(updated);
}
