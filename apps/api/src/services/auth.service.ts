import { supabaseAdmin } from '../lib/supabase.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { mapProfile } from './mappers.js';
import type { RegisterInput, LoginInput } from '@amtehi/shared';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Registrasi user baru via Supabase Auth, lalu pastikan row `profiles` ada.
 * Catatan: idealnya pembuatan profile ditangani trigger DB; di sini kita
 * lakukan upsert sebagai jaring pengaman.
 */
export async function register(input: RegisterInput) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (error || !data.user) {
    throw AppError.badRequest(
      error?.message ?? 'Gagal mendaftarkan user',
      'REGISTER_FAILED',
    );
  }

  const profile = await prisma.profile.upsert({
    where: { id: data.user.id },
    update: {
      fullName: input.fullName,
      nim: input.nim,
      faculty: input.faculty,
      phone: input.phone,
    },
    create: {
      id: data.user.id,
      fullName: input.fullName,
      nim: input.nim,
      faculty: input.faculty,
      phone: input.phone,
    },
  });

  return mapProfile(profile);
}

/**
 * Login: tukar email+password dengan sesi Supabase.
 * Kembalikan token agar controller dapat menaruhnya di httpOnly cookie.
 */
export async function login(
  input: LoginInput,
): Promise<{ tokens: SessionTokens; profile: ReturnType<typeof mapProfile> }> {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session || !data.user) {
    throw AppError.unauthorized('Email atau password salah', 'INVALID_CREDENTIALS');
  }

  // Pastikan profil ada (jaring pengaman bila trigger gagal)
  const profile = await prisma.profile.upsert({
    where: { id: data.user.id },
    update: {},
    create: {
      id: data.user.id,
      fullName:
        (data.user.user_metadata?.full_name as string | undefined) ?? 'Pengguna',
    },
  });

  return {
    tokens: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
    },
    profile: mapProfile(profile),
  };
}

/** Tukar refresh token dengan sesi baru (rotation). */
export async function refresh(refreshToken: string): Promise<SessionTokens> {
  const { data, error } = await supabaseAdmin.auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error || !data.session) {
    throw AppError.unauthorized('Sesi tidak valid', 'REFRESH_FAILED');
  }
  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
  };
}
