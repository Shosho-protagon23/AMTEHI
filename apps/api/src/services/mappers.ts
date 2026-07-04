import type {
  LostItem as PrismaLostItem,
  FoundItem as PrismaFoundItem,
  ClaimRequest as PrismaClaim,
  Profile as PrismaProfile,
  AdminLog as PrismaAdminLog,
} from '@prisma/client';
import type {
  LostItem,
  FoundItem,
  ClaimRequest,
  UserProfile,
  AdminLog,
  ItemCategory,
  ItemStatus,
  ItemType,
  ClaimStatus,
  UserRole,
  AdminAction,
} from '@amtehi/shared';

/**
 * Mapper DB (Prisma) → bentuk API (camelCase, tanggal ISO string).
 * Memisahkan representasi penyimpanan dari kontrak API.
 */

type ProfileSummary = Pick<PrismaProfile, 'id' | 'fullName' | 'avatarUrl'>;

function mapOwner(p?: ProfileSummary | null) {
  if (!p) return undefined;
  return { id: p.id, fullName: p.fullName, avatarUrl: p.avatarUrl };
}

export function mapProfile(p: PrismaProfile): UserProfile {
  return {
    id: p.id,
    fullName: p.fullName,
    nim: p.nim,
    faculty: p.faculty,
    phone: p.phone,
    avatarUrl: p.avatarUrl,
    role: p.role as UserRole,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function mapLostItem(
  i: PrismaLostItem & { owner?: ProfileSummary | null },
): LostItem {
  return {
    id: i.id,
    userId: i.userId,
    title: i.title,
    description: i.description,
    category: i.category as ItemCategory,
    lastSeenAt: i.lastSeenAt?.toISOString() ?? null,
    lastSeenLoc: i.lastSeenLoc,
    photoUrl: i.photoUrl,
    status: i.status as ItemStatus,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
    owner: mapOwner(i.owner),
  };
}

export function mapFoundItem(
  i: PrismaFoundItem & { owner?: ProfileSummary | null },
): FoundItem {
  return {
    id: i.id,
    userId: i.userId,
    title: i.title,
    description: i.description,
    category: i.category as ItemCategory,
    foundAt: i.foundAt?.toISOString() ?? null,
    foundLoc: i.foundLoc,
    storageLoc: i.storageLoc,
    photoUrl: i.photoUrl,
    status: i.status as ItemStatus,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
    owner: mapOwner(i.owner),
  };
}

export function mapClaim(
  c: PrismaClaim & { claimant?: ProfileSummary | null },
): ClaimRequest {
  return {
    id: c.id,
    claimantId: c.claimantId,
    itemId: c.itemId,
    itemType: c.itemType as ItemType,
    proofText: c.proofText,
    proofPhotoUrl: c.proofPhotoUrl,
    status: c.status as ClaimStatus,
    adminNote: c.adminNote,
    reviewedBy: c.reviewedBy,
    reviewedAt: c.reviewedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    claimant: mapOwner(c.claimant),
  };
}

export function mapAdminLog(
  l: PrismaAdminLog & { admin?: ProfileSummary | null },
): AdminLog {
  return {
    id: l.id,
    adminId: l.adminId,
    action: l.action as AdminAction,
    targetType: l.targetType,
    targetId: l.targetId,
    detail: l.detail,
    createdAt: l.createdAt.toISOString(),
    admin: mapOwner(l.admin),
  };
}
