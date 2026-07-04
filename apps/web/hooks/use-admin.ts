'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  AdminAction,
  AdminLog,
  ClaimRequest,
  ClaimStatus,
  DeleteItemInput,
  ReviewClaimInput,
  UpdateUserRoleInput,
  UserProfile,
} from '@amtehi/shared';

/** Bentuk statistik dari GET /admin/stats (mengikuti stats.service backend). */
export interface AdminStats {
  lostItems: { open: number; claimed: number; closed: number };
  foundItems: { open: number; claimed: number; closed: number };
  pendingClaims: number;
  totalUsers: number;
}

/** Statistik ringkas untuk dashboard admin. */
export function useStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      const res = await api.get('/admin/stats');
      return res.data.data as AdminStats;
    },
  });
}

/** Daftar semua klaim (admin), opsional filter status. */
export function useAllClaims(status?: ClaimStatus) {
  return useQuery({
    queryKey: ['admin', 'claims', status ?? 'all'],
    queryFn: async (): Promise<ClaimRequest[]> => {
      const res = await api.get('/admin/claims', {
        params: status ? { status } : undefined,
      });
      return res.data.data as ClaimRequest[];
    },
  });
}

/** Daftar seluruh user (admin). */
export function useUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async (): Promise<UserProfile[]> => {
      const res = await api.get('/admin/users');
      return res.data.data as UserProfile[];
    },
  });
}

/** Daftar audit log admin, opsional filter action. */
export function useAdminLogs(action?: AdminAction) {
  return useQuery({
    queryKey: ['admin', 'logs', action ?? 'all'],
    queryFn: async (): Promise<AdminLog[]> => {
      const res = await api.get('/admin/logs', {
        params: action ? { action } : undefined,
      });
      return res.data.data as AdminLog[];
    },
  });
}

interface UpdateRoleVars {
  id: string;
  input: UpdateUserRoleInput;
}

/** Ubah role user (student ↔ staff). */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: UpdateRoleVars): Promise<UserProfile> => {
      const res = await api.patch(`/admin/users/${id}/role`, input);
      return res.data.data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] });
    },
  });
}

interface DeleteItemVars {
  id: string;
  input: DeleteItemInput;
}

/** Hapus laporan barang (moderasi admin). */
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: DeleteItemVars): Promise<void> => {
      await api.delete(`/admin/items/${id}`, { data: input });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'logs'] });
    },
  });
}

interface ReviewClaimVars {
  id: string;
  input: ReviewClaimInput;
}

/**
 * Review klaim (approve/reject). Setelah sukses, invalidate cache klaim & stats
 * karena approve dapat mengubah status item terkait.
 */
export function useReviewClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: ReviewClaimVars): Promise<ClaimRequest> => {
      const res = await api.patch(`/claims/${id}/review`, input);
      return res.data.data as ClaimRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'claims'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
