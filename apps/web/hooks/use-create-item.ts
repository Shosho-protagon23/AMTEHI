'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  ItemType,
  LostItem,
  FoundItem,
  CreateLostItemInput,
  CreateFoundItemInput,
} from '@amtehi/shared';

type CreateItemInput<T extends ItemType> = T extends 'lost'
  ? CreateLostItemInput
  : CreateFoundItemInput;

type CreatedItem<T extends ItemType> = T extends 'lost' ? LostItem : FoundItem;

/**
 * Mutation untuk membuat laporan barang (lost/found) lewat API.
 * Setelah sukses, cache list item di-invalidate agar data segar.
 */
export function useCreateItem<T extends ItemType>(type: T) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateItemInput<T>): Promise<CreatedItem<T>> => {
      const res = await api.post(`/items/${type}`, input);
      return res.data.data as CreatedItem<T>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', type] });
    },
  });
}
