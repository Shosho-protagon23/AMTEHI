import type { Response } from 'express';

/**
 * Helper untuk standardisasi format response API sesuai konvensi AMTEHI.
 */

interface SuccessMeta {
  total?: number;
  page?: number;
  pageSize?: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: SuccessMeta,
): Response {
  return res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}
