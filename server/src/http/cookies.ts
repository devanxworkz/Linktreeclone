import type { Response } from 'express';
import { config } from '../config.js';

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(config.sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    expires: expiresAt,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(config.sessionCookieName, { path: '/' });
}
