import { Router } from 'express';
import { updateProfileSchema } from '@amtehi/shared';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/profile.controller.js';

const router = Router();

router.get('/me', requireAuth, asyncHandler(ctrl.getMyProfile));
router.patch(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(ctrl.updateMyProfile),
);

export default router;
