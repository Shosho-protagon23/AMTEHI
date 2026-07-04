import type { Request, Response } from 'express';
import { updateProfileSchema } from '@amtehi/shared';
import { getValidated } from '../middleware/validate.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/app-error.js';
import * as profileService from '../services/profile.service.js';

function requireUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export async function getMyProfile(req: Request, res: Response) {
  const user = requireUser(req);
  const profile = await profileService.getProfile(user.id);
  return sendSuccess(res, profile);
}

export async function updateMyProfile(req: Request, res: Response) {
  const user = requireUser(req);
  const input = getValidated<typeof updateProfileSchema>(req, 'body');
  const profile = await profileService.updateProfile(user.id, input);
  return sendSuccess(res, profile);
}
