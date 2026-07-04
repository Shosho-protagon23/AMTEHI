import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadSinglePhoto } from '../middleware/upload.js';
import * as ctrl from '../controllers/upload.controller.js';

const router = Router();

// Upload foto item [auth] — multipart/form-data, field `photo`
router.post(
  '/item-photo',
  requireAuth,
  uploadSinglePhoto,
  asyncHandler(ctrl.uploadPhoto),
);

export default router;
