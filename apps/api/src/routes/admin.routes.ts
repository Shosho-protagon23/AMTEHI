import { Router } from 'express';
import { updateUserRoleSchema, deleteItemSchema } from '@amtehi/shared';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as ctrl from '../controllers/admin.controller.js';
import * as claimCtrl from '../controllers/claim.controller.js';

const router = Router();

// Semua route admin wajib auth + admin
router.use(requireAuth, requireAdmin);

router.get('/stats', asyncHandler(ctrl.getStats));
router.get('/users', asyncHandler(ctrl.listUsers));
router.get('/claims', asyncHandler(claimCtrl.listAllClaims));
router.get('/logs', asyncHandler(ctrl.listLogs));

// Ubah role user (student ↔ staff)
router.patch(
  '/users/:id/role',
  validate(updateUserRoleSchema),
  asyncHandler(ctrl.updateUserRole),
);

// Hapus laporan barang (moderasi) — wajib sertakan alasan
router.delete(
  '/items/:id',
  validate(deleteItemSchema),
  asyncHandler(ctrl.deleteItem),
);

export default router;
