import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import routes from './routes/index.js';

/**
 * Bangun & konfigurasi aplikasi Express.
 * Dipisah dari index.ts agar mudah diuji.
 */
export function createApp() {
  const app = express();

  // Trust proxy Vercel (1 hop) — request tiba lewat proxy sehingga header
  // X-Forwarded-For selalu ada. Tanpa ini, express-rate-limit menolak menebak
  // IP klien (ERR_ERL_UNEXPECTED_X_FORWARDED_FOR). Nilai 1 lebih aman daripada
  // `true` karena tidak mempercayai seluruh rantai proxy secara membabi buta.
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // CORS — hanya origin frontend yang diizinkan, dukung cookie kredensial
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );

  // Body & cookie parser dengan batas ukuran wajar
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Rate limiting global
  app.use(globalLimiter);

  // Routes
  app.use('/api', routes);

  // 404 + error handler (paling akhir)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
