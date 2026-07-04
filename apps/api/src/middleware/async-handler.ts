import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Bungkus async controller agar error otomatis diteruskan ke error handler global,
 * tanpa perlu try-catch berulang di setiap handler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
