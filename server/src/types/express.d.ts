import type { SessionUser } from '../services/sessions.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: SessionUser;
        tenantId: string;
        token: string;
      };
    }
  }
}

export {};
