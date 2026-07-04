import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 AMTEHI API berjalan di http://localhost:${env.PORT}`);
  console.log(`   Mode: ${env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${env.PORT}/api/health`);
});
