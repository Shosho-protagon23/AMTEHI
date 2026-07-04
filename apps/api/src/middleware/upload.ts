import multer from 'multer';
import { MAX_FILE_SIZE_BYTES, ALLOWED_IMAGE_MIME_TYPES } from '@amtehi/shared';
import { AppError } from '../utils/app-error.js';

/**
 * Middleware upload foto pakai Multer (memory storage — file ditahan di RAM
 * lalu diteruskan ke Supabase Storage, tidak ditulis ke disk).
 *
 * Validasi mime type & ukuran dilakukan di SERVER — jangan percaya header client.
 */
const allowed = ALLOWED_IMAGE_MIME_TYPES as readonly string[];

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.includes(file.mimetype)) {
      cb(
        AppError.badRequest(
          'Format file tidak didukung. Hanya JPG, PNG, atau WEBP.',
          'INVALID_FILE_TYPE',
        ),
      );
      return;
    }
    cb(null, true);
  },
});

/** Terima satu file pada field `photo`. */
export const uploadSinglePhoto = uploader.single('photo');
