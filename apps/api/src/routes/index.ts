import { Router } from 'express';
import authRoutes from './auth.routes.js';
import itemRoutes from './item.routes.js';
import claimRoutes from './claim.routes.js';
import profileRoutes from './profile.routes.js';
import uploadRoutes from './upload.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'amtehi-api' } });
});

router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/claims', claimRoutes);
router.use('/profile', profileRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
