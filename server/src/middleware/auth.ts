import type { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import { forbidden, unauthorized } from '../http/errors.js';
import { findTenantByOwner } from '../services/account.js';
import { resolveSession } from '../services/sessions.js';

/**
 * Attaches `req.auth` when a valid session cookie is present. Never throws —
 * routes decide whether auth is required.
 */
export async function attachAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[config.sessionCookieName];
    if (!token || typeof token !== 'string') return next();
    const user = await resolveSession(token);
    if (!user) return next();
    const tenant = await findTenantByOwner(user.id);
    if (!tenant) return next();
    req.auth = { user, tenantId: tenant.id, token };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) return next(unauthorized());
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) return next(unauthorized());
  if (req.auth.user.role !== 'admin') return next(forbidden('Administrators only.'));
  next();
}
