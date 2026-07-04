import { Router } from 'express';
import { registerSchema, loginSchema } from '@amtehi/shared';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rate-limit.js';
import * as ctrl from '../controllers/auth.controller.js';

const router = Router();

// Auth endpoint dibatasi lebih ketat (10 req / 15 menit)
router.use(authLimiter);

router.post('/register', validate(registerSchema), asyncHandler(ctrl.register));
router.post('/login', validate(loginSchema), asyncHandler(ctrl.login));
router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));

export default router;
