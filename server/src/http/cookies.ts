import type { Response } from 'express';
import { config } from '../config.js';

function cookieOptions(expires?: Date): {
  httpOnly: boolean;
  sameSite: 'lax' | 'none' | 'strict';
  secure: boolean;
  path: string;
  expires?: Date;
} {
  return {
    httpOnly: true,
    sameSite: config.sessionCookieSameSite,
    secure: config.isProd,
    path: '/',
    ...(expires ? { expires } : {}),
  };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(config.sessionCookieName, token, cookieOptions(expiresAt));
}

// Must mirror the attributes used when the cookie was set, otherwise browsers
// keep the old cookie instead of deleting it.
export function clearSessionCookie(res: Response): void {
  res.clearCookie(config.sessionCookieName, cookieOptions());
}
