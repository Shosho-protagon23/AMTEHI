import axios, { AxiosError } from 'axios';
import type { ApiError } from '@amtehi/shared';

/**
 * Axios instance untuk komunikasi dengan backend AMTEHI.
 * `withCredentials: true` agar httpOnly cookie (JWT) ikut terkirim otomatis.
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Flag untuk mencegah loop refresh tak berujung
let isRefreshing = false;

/**
 * Interceptor: jika dapat 401, coba refresh token sekali, lalu ulangi request.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !isRefreshing &&
      !original.url?.includes('/auth/')
    ) {
      isRefreshing = true;
      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        return api.request(original);
      } catch (refreshErr) {
        isRefreshing = false;
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  },
);

/** Ekstrak pesan error yang ramah dari response API. */
export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    if (data?.error?.message) return data.error.message;
  }
  return 'Terjadi kesalahan. Coba lagi nanti.';
}
