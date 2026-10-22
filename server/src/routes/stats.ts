import { Router } from 'express';
import { wrap } from '../http/async.js';
import { requireAuth } from '../middleware/auth.js';
import { getOwnerStats } from '../services/analytics.js';

export const statsRouter = Router();

statsRouter.get(
  '/',
  requireAuth,
  wrap(async (req, res) => {
    res.json({ stats: await getOwnerStats(req.auth!.tenantId) });
  }),
);
