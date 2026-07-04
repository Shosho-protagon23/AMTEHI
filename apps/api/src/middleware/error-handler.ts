import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { AppError } from '../utils/app-error.js';
import { sendError } from '../utils/response.js';
import { isProduction } from '../config/env.js';

/**
 * Error handler global. Harus didaftarkan PALING AKHIR setelah semua route.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): Response {
  // Error validasi Zod
  if (err instanceof ZodError) {
    return sendError(
      res,
      400,
      'VALIDATION_ERROR',
      'Input tidak valid',
      err.flatten().fieldErrors,
    );
  }

  // Error upload Multer (mis. file terlalu besar)
  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran file melebihi batas maksimal (5MB)'
        : `Gagal mengunggah file: ${err.message}`;
    return sendError(res, 400, 'UPLOAD_ERROR', message);
  }

  // Error domain terstandar
  if (err instanceof AppError) {
    return sendError(res, err.status, err.code, err.message, err.details);
  }

  // Error tak terduga — jangan bocorkan detail di production
  console.error('[UNEXPECTED ERROR]', err);
  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    'Terjadi kesalahan pada server',
    isProduction ? undefined : String(err),
  );
}

/** Handler untuk route yang tidak ditemukan (404). */
export function notFoundHandler(_req: Request, res: Response): Response {
  return sendError(res, 404, 'ROUTE_NOT_FOUND', 'Endpoint tidak ditemukan');
}
