import { Router } from 'express';
import {
  createLostItemSchema,
  updateLostItemSchema,
  createFoundItemSchema,
  updateFoundItemSchema,
  itemQuerySchema,
} from '@amtehi/shared';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/item.controller.js';

const router = Router();

// ---------- Lost ----------
router.get('/lost', validate(itemQuerySchema, 'query'), asyncHandler(ctrl.listLost));
router.get('/lost/:id', asyncHandler(ctrl.getLost));
router.post(
  '/lost',
  requireAuth,
  validate(createLostItemSchema),
  asyncHandler(ctrl.createLost),
);
router.patch(
  '/lost/:id',
  requireAuth,
  validate(updateLostItemSchema),
  asyncHandler(ctrl.updateLost),
);
router.delete('/lost/:id', requireAuth, asyncHandler(ctrl.deleteLost));

// ---------- Found ----------
router.get('/found', validate(itemQuerySchema, 'query'), asyncHandler(ctrl.listFound));
router.get('/found/:id', asyncHandler(ctrl.getFound));
router.post(
  '/found',
  requireAuth,
  validate(createFoundItemSchema),
  asyncHandler(ctrl.createFound),
);
router.patch(
  '/found/:id',
  requireAuth,
  validate(updateFoundItemSchema),
  asyncHandler(ctrl.updateFound),
);
router.delete('/found/:id', requireAuth, asyncHandler(ctrl.deleteFound));

export default router;
