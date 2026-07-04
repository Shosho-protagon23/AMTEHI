import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { mapLostItem, mapFoundItem } from './mappers.js';
import type {
  CreateLostItemInput,
  UpdateLostItemInput,
  CreateFoundItemInput,
  UpdateFoundItemInput,
  ItemQuery,
} from '@amtehi/shared';

const ownerSelect = {
  owner: { select: { id: true, fullName: true, avatarUrl: true } },
} as const;

/** Bangun filter where bersama dari query (search + kategori + status). */
function buildWhere(query: ItemQuery) {
  const where: Record<string, unknown> = {};
  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ];
  }
  return where;
}

// =================== LOST ITEMS ===================

export async function listLostItems(query: ItemQuery) {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [items, total] = await Promise.all([
    prisma.lostItem.findMany({
      where,
      include: ownerSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.pageSize,
    }),
    prisma.lostItem.count({ where }),
  ]);

  return { items: items.map(mapLostItem), total };
}

export async function getLostItem(id: string) {
  const item = await prisma.lostItem.findUnique({
    where: { id },
    include: ownerSelect,
  });
  if (!item) throw AppError.notFound('Barang hilang tidak ditemukan', 'ITEM_NOT_FOUND');
  return mapLostItem(item);
}

export async function createLostItem(userId: string, input: CreateLostItemInput) {
  const item = await prisma.lostItem.create({
    data: { ...input, userId },
    include: ownerSelect,
  });
  return mapLostItem(item);
}

export async function updateLostItem(
  id: string,
  userId: string,
  isAdmin: boolean,
  input: UpdateLostItemInput,
) {
  await assertOwnership('lost', id, userId, isAdmin);
  const item = await prisma.lostItem.update({
    where: { id },
    data: input,
    include: ownerSelect,
  });
  return mapLostItem(item);
}

export async function deleteLostItem(
  id: string,
  userId: string,
  isAdmin: boolean,
) {
  await assertOwnership('lost', id, userId, isAdmin);
  await prisma.lostItem.delete({ where: { id } });
}

// =================== FOUND ITEMS ===================

export async function listFoundItems(query: ItemQuery) {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [items, total] = await Promise.all([
    prisma.foundItem.findMany({
      where,
      include: ownerSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.pageSize,
    }),
    prisma.foundItem.count({ where }),
  ]);

  return { items: items.map(mapFoundItem), total };
}

export async function getFoundItem(id: string) {
  const item = await prisma.foundItem.findUnique({
    where: { id },
    include: ownerSelect,
  });
  if (!item) throw AppError.notFound('Barang temuan tidak ditemukan', 'ITEM_NOT_FOUND');
  return mapFoundItem(item);
}

export async function createFoundItem(userId: string, input: CreateFoundItemInput) {
  const item = await prisma.foundItem.create({
    data: { ...input, userId },
    include: ownerSelect,
  });
  return mapFoundItem(item);
}

export async function updateFoundItem(
  id: string,
  userId: string,
  isAdmin: boolean,
  input: UpdateFoundItemInput,
) {
  await assertOwnership('found', id, userId, isAdmin);
  const item = await prisma.foundItem.update({
    where: { id },
    data: input,
    include: ownerSelect,
  });
  return mapFoundItem(item);
}

export async function deleteFoundItem(
  id: string,
  userId: string,
  isAdmin: boolean,
) {
  await assertOwnership('found', id, userId, isAdmin);
  await prisma.foundItem.delete({ where: { id } });
}

// =================== Helper otorisasi kepemilikan ===================

/**
 * Pastikan resource ada DAN milik user (atau user adalah admin) sebelum update/delete.
 * Mencegah IDOR — jangan percaya hanya pada filter id.
 */
async function assertOwnership(
  type: 'lost' | 'found',
  id: string,
  userId: string,
  isAdmin: boolean,
): Promise<void> {
  const record =
    type === 'lost'
      ? await prisma.lostItem.findUnique({ where: { id }, select: { userId: true } })
      : await prisma.foundItem.findUnique({ where: { id }, select: { userId: true } });

  if (!record) {
    throw AppError.notFound('Barang tidak ditemukan', 'ITEM_NOT_FOUND');
  }
  if (record.userId !== userId && !isAdmin) {
    throw AppError.forbidden('Anda bukan pemilik barang ini');
  }
}
