'use client';

import { useCallback, useRef, useState } from 'react';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@amtehi/shared';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  /** File terpilih saat ini (controlled). */
  value: File | null;
  /** Dipanggil saat file dipilih/dihapus. */
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(',');

/**
 * Komponen upload foto: drag-and-drop + klik + preview.
 * Validasi client-side (format & ukuran) sebagai UX awal —
 * backend tetap memvalidasi ulang demi keamanan.
 */
export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;

      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as never)) {
        setError('Format harus JPG, PNG, atau WEBP.');
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`Ukuran maksimal ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      // Bersihkan object URL lama agar tidak bocor memori
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      onChange(file);
    },
    [onChange],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    validateAndSet(e.dataTransfer.files?.[0]);
  }

  function handleRemove() {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center font-mono text-sm transition-colors',
          dragging
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface hover:border-primary',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {value && preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Pratinjau foto"
            className="max-h-48 rounded border border-border object-contain"
          />
        ) : (
          <>
            <span className="text-2xl text-primary">+</span>
            <p className="text-muted">
              Seret foto ke sini atau{' '}
              <span className="text-secondary">klik untuk pilih</span>
            </p>
            <p className="text-xs text-muted">
              JPG/PNG/WEBP · maks {MAX_FILE_SIZE_MB}MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </div>

      {value && (
        <div className="flex items-center justify-between text-sm">
          <span className="truncate font-mono text-muted">{value.name}</span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="text-danger hover:underline disabled:opacity-50"
          >
            Hapus
          </button>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
