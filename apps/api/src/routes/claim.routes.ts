import { Router } from 'express';
import { createClaimSchema, reviewClaimSchema } from '@amtehi/shared';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as ctrl from '../controllers/claim.controller.js';

const router = Router();

// Ajukan klaim [auth]
router.post(
  '/',
  requireAuth,
  validate(createClaimSchema),
  asyncHandler(ctrl.createClaim),
);

// Daftar klaim milik sendiri [auth]
router.get('/me', requireAuth, asyncHandler(ctrl.listMyClaims));

// Review klaim [admin]
router.patch(
  '/:id/review',
  requireAuth,
  requireAdmin,
  validate(reviewClaimSchema),
  asyncHandler(ctrl.reviewClaim),
);

export default router;
