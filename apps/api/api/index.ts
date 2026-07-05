// Entry point serverless untuk Vercel.
// @vercel/node mendeteksi Express app yang di-export default sebagai handler
// (req, res) dan mengadaptasinya ke signature Lambda.
//
// Sengaja import dari HASIL KOMPILASI `../dist/app.js`, bukan `../src/app.ts`,
// agar esbuild tidak perlu me-resolve ESM `.js`→`.ts` (konvensi NodeNext) maupun
// symlink workspace @amtehi/shared. dist adalah plain JS yang aman ditelusuri.
import { createApp } from '../dist/app.js';

const app = createApp();

export default app;
