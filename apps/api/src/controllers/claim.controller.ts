import type { Request, Response } from 'express';
import { createClaimSchema, reviewClaimSchema } from '@amtehi/shared';
import { getValidated } from '../middleware/validate.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/app-error.js';
import * as claimService from '../services/claim.service.js';

function requireUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export async function createClaim(req: Request, res: Response) {
  const user = requireUser(req);
  const input = getValidated<typeof createClaimSchema>(req, 'body');
  const claim = await claimService.createClaim(user.id, input);
  return sendSuccess(res, claim, 201);
}

export async function listMyClaims(req: Request, res: Response) {
  const user = requireUser(req);
  const claims = await claimService.listMyClaims(user.id);
  return sendSuccess(res, claims, 200, { total: claims.length });
}

export async function listAllClaims(req: Request, res: Response) {
  const status = req.query.status as
    | 'pending'
    | 'approved'
    | 'rejected'
    | undefined;
  const claims = await claimService.listAllClaims(status);
  return sendSuccess(res, claims, 200, { total: claims.length });
}

export async function reviewClaim(req: Request, res: Response) {
  const user = requireUser(req);
  const input = getValidated<typeof reviewClaimSchema>(req, 'body');
  const claim = await claimService.reviewClaim(
    req.params.id as string,
    user.id,
    input,
  );
  return sendSuccess(res, claim);
}
