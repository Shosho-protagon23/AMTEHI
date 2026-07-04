/**
 * Error domain terstandar. Lempar ini dari service/controller; error handler
 * global akan mengubahnya menjadi response error yang konsisten.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(message = 'Data tidak ditemukan', code = 'NOT_FOUND') {
    return new AppError(404, code, message);
  }

  static unauthorized(message = 'Tidak terautentikasi', code = 'UNAUTHORIZED') {
    return new AppError(401, code, message);
  }

  static forbidden(message = 'Akses ditolak', code = 'FORBIDDEN') {
    return new AppError(403, code, message);
  }

  static badRequest(message = 'Permintaan tidak valid', code = 'BAD_REQUEST', details?: unknown) {
    return new AppError(400, code, message, details);
  }

  static conflict(message = 'Konflik data', code = 'CONFLICT') {
    return new AppError(409, code, message);
  }
}
