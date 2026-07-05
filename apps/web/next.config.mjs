import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @amtehi/shared diimpor sebagai source TS, perlu di-transpile
  transpilePackages: ['@amtehi/shared'],
  // Proxy /api/* ke deployment backend di sisi server (same-origin bagi browser),
  // sehingga cookie tetap first-party & SameSite=Strict tanpa CORS lintas-domain.
  // Aktif hanya bila API_URL di-set (produksi Vercel); di dev lokal axios memakai
  // NEXT_PUBLIC_API_URL absolut sehingga rewrite ini tidak diperlukan.
  async rewrites() {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) return [];
    return [
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    ];
  },
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
