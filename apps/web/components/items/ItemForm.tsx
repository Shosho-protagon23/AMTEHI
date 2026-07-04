'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ITEM_CATEGORIES,
  ITEM_CATEGORY_LABELS,
  createLostItemSchema,
  createFoundItemSchema,
  type ItemType,
} from '@amtehi/shared';
import { useCreateItem } from '@/hooks/use-create-item';
import { useUploadPhoto } from '@/hooks/use-upload';
import { getApiErrorMessage } from '@/lib/api';
import { ImageUpload } from './ImageUpload';

/** Teks yang berbeda antara form barang hilang dan temuan. */
const COPY: Record<
  ItemType,
  { heading: string; cmd: string; dateLabel: string; locLabel: string; locPlaceholder: string }
> = {
  lost: {
    heading: 'Lapor Barang Hilang',
    cmd: 'amtehi report --lost',
    dateLabel: 'Terakhir terlihat',
    locLabel: 'Lokasi terakhir terlihat',
    locPlaceholder: 'mis. Lab Komputer Lt. 3',
  },
  found: {
    heading: 'Lapor Barang Temuan',
    cmd: 'amtehi report --found',
    dateLabel: 'Waktu ditemukan',
    locLabel: 'Lokasi ditemukan',
    locPlaceholder: 'mis. Parkiran Gedung Unit 1',
  },
};

export function ItemForm({ type }: { type: ItemType }) {
  const router = useRouter();
  const createItem = useCreateItem(type);
  const uploadPhoto = useUploadPhoto();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as string,
    date: '',
    location: '',
    storageLoc: '', // hanya dipakai untuk 'found'
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = COPY[type];
  const isSubmitting = uploadPhoto.isPending || createItem.isPending;

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Field umum
    const base = {
      title: form.title,
      description: form.description || undefined,
      category: form.category,
    };

    // Susun payload sesuai jenis item
    const raw =
      type === 'lost'
        ? {
            ...base,
            lastSeenAt: form.date || undefined,
            lastSeenLoc: form.location || undefined,
          }
        : {
            ...base,
            foundAt: form.date || undefined,
            foundLoc: form.location || undefined,
            storageLoc: form.storageLoc || undefined,
          };

    const schema = type === 'lost' ? createLostItemSchema : createFoundItemSchema;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Input tidak valid');
      return;
    }

    try {
      // Upload foto dulu (opsional) untuk dapat URL publik
      let photoUrl: string | undefined;
      if (photo) {
        photoUrl = await uploadPhoto.mutateAsync({ file: photo, itemType: type });
      }

      const created = await createItem.mutateAsync({
        ...parsed.data,
        photoUrl,
      } as never);

      router.push(`/items/${type}/${created.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="card-surface">
        <p className="font-mono text-sm text-success">$ {copy.cmd}</p>
        <h1 className="mt-2 text-2xl font-bold">{copy.heading}</h1>
        <p className="mt-1 text-sm text-muted">
          Lengkapi detail barang. Semakin lengkap, semakin mudah ditemukan.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm text-muted">Judul *</label>
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="input-field"
              placeholder="mis. Dompet kulit cokelat"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">Kategori *</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="input-field"
            >
              <option value="">Pilih kategori</option>
              {ITEM_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {ITEM_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="input-field min-h-24 resize-y"
              placeholder="Ciri-ciri, merk, warna, isi, atau detail lainnya..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-muted">
                {copy.dateLabel}
              </label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">
                {copy.locLabel}
              </label>
              <input
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className="input-field"
                placeholder={copy.locPlaceholder}
              />
            </div>
          </div>

          {type === 'found' && (
            <div>
              <label className="mb-1 block text-sm text-muted">
                Lokasi penyimpanan barang
              </label>
              <input
                value={form.storageLoc}
                onChange={(e) => update('storageLoc', e.target.value)}
                className="input-field"
                placeholder="mis. Pos Satpam / Ruang BAAK"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-muted">
              Foto barang (opsional)
            </label>
            <ImageUpload value={photo} onChange={setPhoto} disabled={isSubmitting} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </form>
      </div>
    </div>
  );
}
