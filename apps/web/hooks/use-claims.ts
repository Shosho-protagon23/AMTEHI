'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ClaimRequest, CreateClaimInput } from '@amtehi/shared';

/**
 * Mutation untuk mengajukan klaim atas sebuah item (lost/found).
 * Setelah sukses, cache klaim & item terkait di-invalidate.
 */
export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClaimInput): Promise<ClaimRequest> => {
      const res = await api.post('/claims', input);
      return res.data.data as ClaimRequest;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claims', 'me'] });
      queryClient.invalidateQueries({
        queryKey: ['item', variables.itemType, variables.itemId],
      });
    },
  });
}

/** Ambil daftar klaim yang diajukan oleh user yang sedang login. */
export function useMyClaims() {
  return useQuery({
    queryKey: ['claims', 'me'],
    queryFn: async (): Promise<ClaimRequest[]> => {
      const res = await api.get('/claims/me');
      return res.data.data as ClaimRequest[];
    },
  });
}
