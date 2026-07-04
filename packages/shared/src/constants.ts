/**
 * Konstanta domain AMTEHI yang dipakai bersama oleh frontend & backend.
 */

// Kategori barang — sesuaikan dengan kebutuhan kampus
export const ITEM_CATEGORIES = [
  'electronics', // Elektronik (HP, laptop, charger, dll)
  'document',    // Dokumen (KTM, KTP, surat, dll)
  'clothing',    // Pakaian & aksesoris
  'wallet',      // Dompet & uang
  'key',         // Kunci
  'book',        // Buku & alat tulis
  'other',       // Lainnya
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

// Label kategori untuk UI (Bahasa Indonesia)
export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  electronics: 'Elektronik',
  document: 'Dokumen',
  clothing: 'Pakaian',
  wallet: 'Dompet',
  key: 'Kunci',
  book: 'Buku & Alat Tulis',
  other: 'Lainnya',
};

// Status item
export const ITEM_STATUSES = ['open', 'claimed', 'closed'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  open: 'Terbuka',
  claimed: 'Diklaim',
  closed: 'Ditutup',
};

// Jenis item
export const ITEM_TYPES = ['lost', 'found'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

// Status klaim
export const CLAIM_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

// Role user
export const USER_ROLES = ['student', 'staff', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Batasan upload file
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// ----- Audit trail admin -----
// Jenis aksi admin yang dicatat di tabel admin_logs.
export const ADMIN_ACTIONS = [
  'review_claim',   // Approve/reject klaim
  'delete_item',    // Hapus laporan barang
  'update_role',    // Ubah role user
] as const;
export type AdminAction = (typeof ADMIN_ACTIONS)[number];

export const ADMIN_ACTION_LABELS: Record<AdminAction, string> = {
  review_claim: 'Review Klaim',
  delete_item: 'Hapus Barang',
  update_role: 'Ubah Role',
};
