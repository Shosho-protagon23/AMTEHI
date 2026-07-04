'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClaimSchema, type ItemType } from '@amtehi/shared';
import { useCreateClaim } from '@/hooks/use-claims';
import { useUploadPhoto } from '@/hooks/use-upload';
import { useItemDetail } from '@/hooks/use-items';
import { getApiErrorMessage } from '@/lib/api';
import { ImageUpload } from '@/components/items/ImageUpload';

/**
 * Form pengajuan klaim atas sebuah item. User menjelaskan bukti kepemilikan
 * dan boleh melampirkan foto bukti. Validasi mengikuti createClaimSchema.
 */
export function ClaimForm({ type, itemId }: { type: ItemType; itemId: string }) {
  const router = useRouter();
  const createClaim = useCreateClaim();
  const uploadPhoto = useUploadPhoto();
  const { data: item } = useItemDetail(type, itemId);

  const [proofText, setProofText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSubmitting = uploadPhoto.isPending || createClaim.isPending;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      // Upload foto bukti dulu (opsional) untuk dapat URL
      let proofPhotoUrl: string | undefined;
      if (photo) {
        proofPhotoUrl = await uploadPhoto.mutateAsync({ file: photo, itemType: type });
      }

      const parsed = createClaimSchema.safeParse({
        itemId,
        itemType: type,
        proofText,
        proofPhotoUrl,
      });
      if (!parsed.success) {
        setError(parsed.error.errors[0]?.message ?? 'Input tidak valid');
        return;
      }

      await createClaim.mutateAsync(parsed.data);
      router.push('/claims');
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="card-surface">
        <p className="font-mono text-sm text-success">$ amtehi claim --submit</p>
        <h1 className="mt-2 text-2xl font-bold">Ajukan Klaim</h1>
        {item && (
          <p className="mt-1 text-sm text-muted">
            Mengklaim:{' '}
            <span className="font-mono text-text">{item.title}</span>
          </p>
        )}
        <p className="mt-1 text-sm text-muted">
          Jelaskan bukti kepemilikan sedetail mungkin agar admin dapat
          memverifikasi klaim Anda.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm text-muted">
              Bukti kepemilikan *
            </label>
            <textarea
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              className="input-field min-h-32 resize-y"
              placeholder="mis. Ada goresan di sudut kiri, isi dompet ada KTM atas nama saya, struk pembelian, dll."
            />
            <p className="mt-1 font-mono text-xs text-muted">
              # minimal 10 karakter
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">
              Foto bukti (opsional)
            </label>
            <ImageUpload value={photo} onChange={setPhoto} disabled={isSubmitting} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Klaim'}
          </button>
        </form>
      </div>
    </div>
  );
}
