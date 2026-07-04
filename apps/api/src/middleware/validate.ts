import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny, infer as ZodInfer } from 'zod';

/**
 * Middleware factory: validasi bagian request dengan schema Zod.
 * Hasil parse (sudah ter-coerce) disimpan kembali ke req agar controller pakai data bersih.
 */
type RequestPart = 'body' | 'query' | 'params';

export function validate<T extends ZodTypeAny>(
  schema: T,
  part: RequestPart = 'body',
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Simpan hasil parse di properti khusus agar tipe aman di controller
    (req as Request & { validated?: Record<string, unknown> }).validated = {
      ...(req as Request & { validated?: Record<string, unknown> }).validated,
      [part]: result.data,
    };
    next();
  };
}

/** Helper bertipe untuk mengambil data tervalidasi di controller. */
export function getValidated<T extends ZodTypeAny>(
  req: Request,
  part: RequestPart = 'body',
): ZodInfer<T> {
  return (req as Request & { validated?: Record<string, unknown> }).validated?.[
    part
  ] as ZodInfer<T>;
}
