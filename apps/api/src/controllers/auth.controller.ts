import type { Request, Response } from 'express';
import { registerSchema, loginSchema } from '@amtehi/shared';
import { getValidated } from '../middleware/validate.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/app-error.js';
import { isProduction } from '../config/env.js';
import * as authService from '../services/auth.service.js';
import type { SessionTokens } from '../services/auth.service.js';

const ACCESS_COOKIE = 'sb-access-token';
const REFRESH_COOKIE = 'sb-refresh-token';

/**
 * Set token sesi sebagai httpOnly cookie — Secure + SameSite=Strict.
 * Inilah inti keamanan: token tidak pernah tersentuh JavaScript di browser.
 */
function setAuthCookies(res: Response, tokens: SessionTokens) {
  const common = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
  };
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...common,
    maxAge: tokens.expiresIn * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...common,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
}

export async function register(req: Request, res: Response) {
  const input = getValidated<typeof registerSchema>(req, 'body');
  const profile = await authService.register(input);
  return sendSuccess(res, profile, 201);
}

export async function login(req: Request, res: Response) {
  const input = getValidated<typeof loginSchema>(req, 'body');
  const { tokens, profile } = await authService.login(input);
  setAuthCookies(res, tokens);
  return sendSuccess(res, profile);
}

export async function refresh(req: Request, res: Response) {
  const token = (req.cookies as Record<string, string> | undefined)?.[
    REFRESH_COOKIE
  ];
  if (!token) throw AppError.unauthorized('Refresh token tidak ditemukan');
  const tokens = await authService.refresh(token);
  setAuthCookies(res, tokens);
  return sendSuccess(res, { refreshed: true });
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookies(res);
  return sendSuccess(res, { loggedOut: true });
}
