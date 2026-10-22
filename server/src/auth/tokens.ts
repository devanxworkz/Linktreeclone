import { createHash, randomBytes } from 'node:crypto';

/** Opaque session token handed to the browser. Never stored in plaintext. */
export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** What we store at rest: a SHA-256 of the token. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
