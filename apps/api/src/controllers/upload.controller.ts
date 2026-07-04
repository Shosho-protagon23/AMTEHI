import type { Request, Response } from 'express';
import { itemTypeSchema } from '@amtehi/shared';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/app-error.js';
import { uploadItemPhoto } from '../lib/storage.js';

function requireUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

/**
 * Upload foto item. Field form: `photo` (file) + `itemType` ('lost'|'found').
 * Mengembalikan { url } untuk disimpan ke field photoUrl saat membuat item.
 */
export async function uploadPhoto(req: Request, res: Response) {
  const user = requireUser(req);

  if (!req.file) {
    throw AppError.badRequest('File foto tidak ditemukan', 'NO_FILE');
  }

  // Validasi itemType dari body (default 'lost' bila tidak diisi)
  const parsed = itemTypeSchema.safeParse(req.body?.itemType ?? 'lost');
  if (!parsed.success) {
    throw AppError.badRequest('itemType harus "lost" atau "found"', 'INVALID_ITEM_TYPE');
  }

  const url = await uploadItemPhoto({
    itemType: parsed.data,
    userId: user.id,
    buffer: req.file.buffer,
    mimeType: req.file.mimetype,
  });

  return sendSuccess(res, { url }, 201);
}
