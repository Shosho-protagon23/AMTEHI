import { supabaseAdmin } from './supabase.js';
import { AppError } from '../utils/app-error.js';
import type { ItemType } from '@amtehi/shared';

const BUCKET = 'item-photos';

/** Map mime type → ekstensi file, sekaligus whitelist format yang diizinkan. */
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Upload foto item ke Supabase Storage (bucket publik `item-photos`).
 * Path: {itemType}/{userId}/{timestamp}-{random}.{ext} sesuai konvensi AMTEHI.
 * Mengembalikan public URL permanen.
 */
export async function uploadItemPhoto(params: {
  itemType: ItemType;
  userId: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<string> {
  const ext = MIME_EXT[params.mimeType];
  if (!ext) {
    throw AppError.badRequest(
      'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.',
      'INVALID_FILE_TYPE',
    );
  }

  // Nama unik anti-tabrakan: timestamp + suffix acak
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${params.itemType}/${params.userId}/${unique}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, params.buffer, {
      contentType: params.mimeType,
      upsert: false,
    });

  if (error) {
    throw new AppError(500, 'UPLOAD_FAILED', `Gagal mengunggah foto: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
