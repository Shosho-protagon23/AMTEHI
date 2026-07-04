import type {
  ItemCategory,
  ItemStatus,
  ItemType,
  ClaimStatus,
  UserRole,
  AdminAction,
} from './constants.js';

/**
 * Tipe domain bersama. Mengikuti bentuk data yang dikirim API (camelCase),
 * bukan bentuk kolom DB (snake_case) — mapping dilakukan di service layer.
 */

export interface UserProfile {
  id: string;
  fullName: string;
  nim: string | null;
  faculty: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LostItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: ItemCategory;
  lastSeenAt: string | null;
  lastSeenLoc: string | null;
  photoUrl: string | null;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  // Relasi opsional saat di-include
  owner?: Pick<UserProfile, 'id' | 'fullName' | 'avatarUrl'>;
}

export interface FoundItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: ItemCategory;
  foundAt: string | null;
  foundLoc: string | null;
  storageLoc: string | null;
  photoUrl: string | null;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  owner?: Pick<UserProfile, 'id' | 'fullName' | 'avatarUrl'>;
}

export interface ClaimRequest {
  id: string;
  claimantId: string;
  itemId: string;
  itemType: ItemType;
  proofText: string | null;
  proofPhotoUrl: string | null;
  status: ClaimStatus;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  claimant?: Pick<UserProfile, 'id' | 'fullName' | 'avatarUrl'>;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: AdminAction;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
  // Relasi opsional saat di-include
  admin?: Pick<UserProfile, 'id' | 'fullName' | 'avatarUrl'>;
}

// ----- Bentuk response API standar -----
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
