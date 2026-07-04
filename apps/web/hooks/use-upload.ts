'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ItemType } from '@amtehi/shared';

interface UploadPhotoVars {
  file: File;
  itemType: ItemType;
}

/**
 * Upload foto item ke backend (multipart/form-data → Supabase Storage).
 * Backend memvalidasi mime type & ukuran, lalu mengembalikan URL publik.
 */
export function useUploadPhoto() {
  return useMutation({
    mutationFn: async ({ file, itemType }: UploadPhotoVars): Promise<string> => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('itemType', itemType);

      const res = await api.post('/upload/item-photo', formData, {
        // Biarkan browser yang menyetel boundary multipart; timpa default JSON
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data.url as string;
    },
  });
}
