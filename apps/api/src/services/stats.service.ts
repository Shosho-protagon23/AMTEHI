import { prisma } from '../lib/prisma.js';

/** Statistik ringkas untuk dashboard admin. */
export async function getStats() {
  const [
    lostOpen,
    lostClaimed,
    lostClosed,
    foundOpen,
    foundClaimed,
    foundClosed,
    pendingClaims,
    totalUsers,
  ] = await Promise.all([
    prisma.lostItem.count({ where: { status: 'open' } }),
    prisma.lostItem.count({ where: { status: 'claimed' } }),
    prisma.lostItem.count({ where: { status: 'closed' } }),
    prisma.foundItem.count({ where: { status: 'open' } }),
    prisma.foundItem.count({ where: { status: 'claimed' } }),
    prisma.foundItem.count({ where: { status: 'closed' } }),
    prisma.claimRequest.count({ where: { status: 'pending' } }),
    prisma.profile.count(),
  ]);

  return {
    lostItems: { open: lostOpen, claimed: lostClaimed, closed: lostClosed },
    foundItems: { open: foundOpen, claimed: foundClaimed, closed: foundClosed },
    pendingClaims,
    totalUsers,
  };
}
