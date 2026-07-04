import { z } from 'zod';
import {
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  ITEM_TYPES,
  CLAIM_STATUSES,
  USER_ROLES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './constants.js';

/**
 * Zod schemas — sumber kebenaran tunggal untuk validasi input.
 * Dipakai backend (validasi request) & frontend (React Hook Form resolver).
 */

// ----- Enum schemas -----
export const itemCategorySchema = z.enum(ITEM_CATEGORIES);
export const itemStatusSchema = z.enum(ITEM_STATUSES);
export const itemTypeSchema = z.enum(ITEM_TYPES);
export const claimStatusSchema = z.enum(CLAIM_STATUSES);
export const userRoleSchema = z.enum(USER_ROLES);

// ----- Auth -----
export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  nim: z
    .string()
    .min(5, 'NIM minimal 5 karakter')
    .max(20, 'NIM maksimal 20 karakter')
    .optional(),
  faculty: z.string().max(100).optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s]{8,20}$/, 'Nomor telepon tidak valid')
    .optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ----- Profile -----
// Ubah string kosong menjadi null agar field opsional bisa dikosongkan,
// sementara nilai non-kosong tetap divalidasi sesuai aturan.
const emptyToNull = (v: unknown) => (v === '' ? null : v);

export const updateProfileSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter').optional(),
  nim: z.preprocess(
    emptyToNull,
    z.string().min(5, 'NIM minimal 5 karakter').max(20, 'NIM maksimal 20 karakter').nullable().optional(),
  ),
  faculty: z.preprocess(
    emptyToNull,
    z.string().max(100, 'Fakultas maksimal 100 karakter').nullable().optional(),
  ),
  phone: z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^[0-9+\-\s]{8,20}$/, 'Nomor telepon tidak valid')
      .nullable()
      .optional(),
  ),
  avatarUrl: z.preprocess(
    emptyToNull,
    z.string().url('URL avatar tidak valid').nullable().optional(),
  ),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ----- Lost Item -----
export const createLostItemSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(120),
  description: z.string().max(2000).optional(),
  category: itemCategorySchema,
  lastSeenAt: z.coerce.date().optional(),
  lastSeenLoc: z.string().max(200).optional(),
  photoUrl: z.string().url().optional(),
});
export type CreateLostItemInput = z.infer<typeof createLostItemSchema>;

export const updateLostItemSchema = createLostItemSchema.partial().extend({
  status: itemStatusSchema.optional(),
});
export type UpdateLostItemInput = z.infer<typeof updateLostItemSchema>;

// ----- Found Item -----
export const createFoundItemSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(120),
  description: z.string().max(2000).optional(),
  category: itemCategorySchema,
  foundAt: z.coerce.date().optional(),
  foundLoc: z.string().max(200).optional(),
  storageLoc: z.string().max(200).optional(),
  photoUrl: z.string().url().optional(),
});
export type CreateFoundItemInput = z.infer<typeof createFoundItemSchema>;

export const updateFoundItemSchema = createFoundItemSchema.partial().extend({
  status: itemStatusSchema.optional(),
});
export type UpdateFoundItemInput = z.infer<typeof updateFoundItemSchema>;

// ----- Claim -----
export const createClaimSchema = z.object({
  itemId: z.string().uuid('ID item tidak valid'),
  itemType: itemTypeSchema,
  proofText: z.string().min(10, 'Jelaskan bukti kepemilikan minimal 10 karakter').max(2000),
  proofPhotoUrl: z.string().url().optional(),
});
export type CreateClaimInput = z.infer<typeof createClaimSchema>;

export const reviewClaimSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminNote: z.string().max(1000).optional(),
});
export type ReviewClaimInput = z.infer<typeof reviewClaimSchema>;

// ----- Admin: kelola user & moderasi -----
// Ubah role user. 'admin' sengaja tidak diizinkan lewat sini untuk mencegah
// eskalasi hak akses via UI — promote admin dilakukan lewat seed/DB.
export const updateUserRoleSchema = z.object({
  role: z.enum(['student', 'staff']),
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

// Hapus item oleh admin (moderasi) — wajib sertakan alasan untuk audit trail.
export const deleteItemSchema = z.object({
  itemType: itemTypeSchema,
  reason: z
    .string()
    .min(5, 'Alasan penghapusan minimal 5 karakter')
    .max(500, 'Alasan maksimal 500 karakter'),
});
export type DeleteItemInput = z.infer<typeof deleteItemSchema>;

// ----- Query / Filter -----
export const itemQuerySchema = z.object({
  q: z.string().max(120).optional(),
  category: itemCategorySchema.optional(),
  status: itemStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});
export type ItemQuery = z.infer<typeof itemQuerySchema>;
