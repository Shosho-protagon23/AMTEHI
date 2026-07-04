import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

/**
 * Rate limiter sesuai konvensi keamanan AMTEHI.
 * Global: 100 req / 15 menit. Auth: 10 req / 15 menit.
 */

const fifteenMinutes = 15 * 60 * 1000;

export const globalLimiter = rateLimit({
  windowMs: fifteenMinutes,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(
      res,
      429,
      'RATE_LIMITED',
      'Terlalu banyak permintaan. Coba lagi nanti.',
    ),
});

export const authLimiter = rateLimit({
  windowMs: fifteenMinutes,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(
      res,
      429,
      'AUTH_RATE_LIMITED',
      'Terlalu banyak percobaan autentikasi. Coba lagi dalam 15 menit.',
    ),
});
