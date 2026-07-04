import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { mapProfile } from './mappers.js';
import type { UpdateProfileInput } from '@amtehi/shared';

export async function getProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile) throw AppError.notFound('Profil tidak ditemukan', 'PROFILE_NOT_FOUND');
  return mapProfile(profile);
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  // Cegah error update pada profil yang belum ada
  const exists = await prisma.profile.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!exists) throw AppError.notFound('Profil tidak ditemukan', 'PROFILE_NOT_FOUND');

  const profile = await prisma.profile.update({
    where: { id: userId },
    data: input,
  });
  return mapProfile(profile);
}
