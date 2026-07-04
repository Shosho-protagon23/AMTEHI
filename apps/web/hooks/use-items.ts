'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { LostItem, FoundItem, ItemType } from '@amtehi/shared';

interface ItemListParams {
  q?: string;
  category?: string;
  status?: string;
  page?: number;
}

interface ItemListResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Ambil daftar item (lost/found) dari API dengan filter. */
export function useItems<T = LostItem | FoundItem>(
  type: ItemType,
  params: ItemListParams = {},
) {
  return useQuery({
    queryKey: ['items', type, params],
    queryFn: async (): Promise<ItemListResult<T>> => {
      const res = await api.get(`/items/${type}`, { params });
      return {
        items: res.data.data as T[],
        total: res.data.meta?.total ?? 0,
        page: res.data.meta?.page ?? 1,
        pageSize: res.data.meta?.pageSize ?? 12,
      };
    },
  });
}

/** Ambil detail satu item. */
export function useItemDetail<T = LostItem | FoundItem>(
  type: ItemType,
  id: string,
) {
  return useQuery({
    queryKey: ['item', type, id],
    queryFn: async (): Promise<T> => {
      const res = await api.get(`/items/${type}/${id}`);
      return res.data.data as T;
    },
    enabled: Boolean(id),
  });
}
