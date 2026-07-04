import type { Request, Response } from 'express';
import {
  createLostItemSchema,
  updateLostItemSchema,
  createFoundItemSchema,
  updateFoundItemSchema,
  itemQuerySchema,
} from '@amtehi/shared';
import { getValidated } from '../middleware/validate.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/app-error.js';
import * as itemService from '../services/item.service.js';

/** Pastikan user ada di request (dipasang requireAuth). */
function requireUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

// =================== LOST ===================

export async function listLost(req: Request, res: Response) {
  const query = getValidated<typeof itemQuerySchema>(req, 'query');
  const { items, total } = await itemService.listLostItems(query);
  return sendSuccess(res, items, 200, {
    total,
    page: query.page,
    pageSize: query.pageSize,
  });
}

export async function getLost(req: Request, res: Response) {
  const item = await itemService.getLostItem(req.params.id as string);
  return sendSuccess(res, item);
}

export async function createLost(req: Request, res: Response) {
  const user = requireUser(req);
  const input = getValidated<typeof createLostItemSchema>(req, 'body');
  const item = await itemService.createLostItem(user.id, input);
  return sendSuccess(res, item, 201);
}

export async function updateLost(req: Request, res: Response) {
  const user = requireUser(req);
  const input = getValidated<typeof updateLostItemSchema>(req, 'body');
  const item = await itemService.updateLostItem(
    req.params.id as string,
    user.id,
    user.role === 'admin',
    input,
  );
  return sendSuccess(res, item);
}

export async function deleteLost(req: Request, res: Response) {
  const user = requireUser(req);
  await itemService.deleteLostItem(
    req.params.id as string,
    user.id,
    user.role === 'admin',
  );
  return sendSuccess(res, { deleted: true });
}

// =================== FOUND ===================

export async function listFound(req: Request, res: Response) {
  const query = getValidated<typeof itemQuerySchema>(req, 'query');
  const { items, total } = await itemService.listFoundItems(query);
  return sendSuccess(res, items, 200, {
    total,
    page: query.page,
    pageSize: query.pageSize,
  });
}

export async function getFound(req: Request, res: Response) {
  const item = await itemService.getFoundItem(req.params.id as string);
  return sendSuccess(res, item);
}

export async function createFound(req: Request, res: Response) {
  const user = requireUser(req);
  const input = getValidated<typeof createFoundItemSchema>(req, 'body');
  const item = await itemService.createFoundItem(user.id, input);
  return sendSuccess(res, item, 201);
}

export async function updateFound(req: Request, res: Response) {
  const user = requireUser(req);
  const input = getValidated<typeof updateFoundItemSchema>(req, 'body');
  const item = await itemService.updateFoundItem(
    req.params.id as string,
    user.id,
    user.role === 'admin',
    input,
  );
  return sendSuccess(res, item);
}

export async function deleteFound(req: Request, res: Response) {
  const user = requireUser(req);
  await itemService.deleteFoundItem(
    req.params.id as string,
    user.id,
    user.role === 'admin',
  );
  return sendSuccess(res, { deleted: true });
}
