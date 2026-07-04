import type { Request, Response } from 'express';
import {
  updateUserRoleSchema,
  deleteItemSchema,
  type AdminAction,
} from '@amtehi/shared';
import { getValidated } from '../middleware/validate.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/app-error.js';
import * as statsService from '../services/stats.service.js';
import * as adminService from '../services/admin.service.js';
import { prisma } from '../lib/prisma.js';
import { mapProfile } from '../services/mappers.js';

/** Pastikan user ada di request (dipasang requireAuth). */
function requireUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

export async function getStats(_req: Request, res: Response) {
  const stats = await statsService.getStats();
  return sendSuccess(res, stats);
}

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return sendSuccess(res, users.map(mapProfile), 200, { total: users.length });
}

export async function updateUserRole(req: Request, res: Response) {
  const admin = requireUser(req);
  const input = getValidated<typeof updateUserRoleSchema>(req, 'body');
  const profile = await adminService.updateUserRole(
    admin.id,
    req.params.id as string,
    input,
  );
  return sendSuccess(res, profile);
}

export async function deleteItem(req: Request, res: Response) {
  const admin = requireUser(req);
  const input = getValidated<typeof deleteItemSchema>(req, 'body');
  await adminService.deleteItem(admin.id, req.params.id as string, input);
  return sendSuccess(res, { deleted: true });
}

export async function listLogs(req: Request, res: Response) {
  const action = req.query.action as AdminAction | undefined;
  const logs = await adminService.listLogs(action);
  return sendSuccess(res, logs, 200, { total: logs.length });
}
