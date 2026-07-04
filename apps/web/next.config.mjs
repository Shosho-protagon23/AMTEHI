import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @amtehi/shared diimpor sebagai source TS, perlu di-transpile
  transpilePackages: ['@amtehi/shared'],
  // Akar monorepo eksplisit agar Next tidak salah pilih lockfile di home dir
  outputFileTracingRoot: join(__dirname, '../../'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  webpack: (config) => {
    // Shared package memakai ESM dengan ekstensi .js yang menunjuk ke file .ts
    // (konvensi NodeNext). Beri tahu webpack cara me-resolve-nya.
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default nextConfig;
