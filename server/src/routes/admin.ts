import { Router } from 'express';
import { wrap } from '../http/async.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import {
  adminAnalytics,
  adminAuditActions,
  adminListAudit,
  adminListUsers,
  adminOverview,
  adminSetUserStatus,
  adminStorefronts,
  adminUserDetail,
} from '../services/admin.js';
import {
  adminAuditQuerySchema,
  adminStatusSchema,
  adminStorefrontQuerySchema,
  adminUserQuerySchema,
} from '../validation/schemas.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  '/overview',
  wrap(async (_req, res) => {
    res.json(await adminOverview());
  }),
);

adminRouter.get(
  '/users',
  wrap(async (req, res) => {
    const { q, status, role, published, page } = adminUserQuerySchema.parse(req.query);
    res.json(
      await adminListUsers({
        q,
        status,
        role,
        published: published === undefined ? undefined : published === 'true',
        page,
      }),
    );
  }),
);

adminRouter.get(
  '/users/:id',
  wrap(async (req, res) => {
    res.json({ user: await adminUserDetail(req.params.id!) });
  }),
);

adminRouter.put(
  '/users/:id/status',
  wrap(async (req, res) => {
    const { status, reason } = adminStatusSchema.parse(req.body);
    const user = await adminSetUserStatus(
      { id: req.auth!.user.id, email: req.auth!.user.email },
      req.params.id!,
      status,
      reason,
    );
    res.json({ user });
  }),
);

adminRouter.get(
  '/storefronts',
  wrap(async (req, res) => {
    const { q, published, page } = adminStorefrontQuerySchema.parse(req.query);
    res.json(
      await adminStorefronts({
        q,
        published: published === undefined ? undefined : published === 'true',
        page,
      }),
    );
  }),
);

adminRouter.get(
  '/analytics',
  wrap(async (_req, res) => {
    res.json(await adminAnalytics());
  }),
);

adminRouter.get(
  '/audit/actions',
  wrap(async (_req, res) => {
    res.json({ actions: await adminAuditActions() });
  }),
);

adminRouter.get(
  '/audit',
  wrap(async (req, res) => {
    const { q, action, page } = adminAuditQuerySchema.parse(req.query);
    res.json(await adminListAudit({ q, action, page }));
  }),
);

// Backwards-compatible alias: the former "usage" view is now Storefronts.
adminRouter.get(
  '/stats',
  wrap(async (req, res) => {
    const { q, published, page } = adminStorefrontQuerySchema.parse(req.query);
    const result = await adminStorefronts({
      q,
      published: published === undefined ? undefined : published === 'true',
      page,
    });
    res.json({ tenants: result.rows });
  }),
);
