import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from './async-handler.js';
import type { UserRole } from '@amtehi/shared';

/** User terautentikasi yang ditempelkan ke request. */
export interface AuthUser {
  id: string;
  email: string | undefined;
  role: UserRole;
}

// Perluas tipe Request Express agar mengenal req.user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Ambil access token dari httpOnly cookie atau header Authorization (Bearer).
 * Cookie lebih diutamakan (sesuai konvensi keamanan AMTEHI).
 */
function extractToken(req: Request): string | null {
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[
    'sb-access-token'
  ];
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return null;
}

/**
 * requireAuth — wajib login.
 * Validasi token via Supabase getUser() (bukan decode manual), lalu ambil role dari profiles.
 */
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      throw AppError.unauthorized('Token tidak ditemukan');
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      throw AppError.unauthorized('Token tidak valid atau kedaluwarsa');
    }

    // Ambil role dari tabel profiles (sumber otoritatif role)
    const profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
      select: { role: true },
    });

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: (profile?.role ?? 'student') as UserRole,
    };

    next();
  },
);

/**
 * requireAdmin — wajib login DAN role admin. Pakai setelah requireAuth.
 */
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  if (req.user.role !== 'admin') {
    throw AppError.forbidden('Hanya admin yang dapat mengakses resource ini');
  }
  next();
}
