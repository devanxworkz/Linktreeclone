import { Router } from 'express';
import { wrap } from '../http/async.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createLink,
  deleteLink,
  listLinks,
  reorderLinks,
  updateLink,
} from '../services/links.js';
import { linkCreateSchema, linkUpdateSchema, reorderSchema } from '../validation/schemas.js';

export const linksRouter = Router();

linksRouter.use(requireAuth);

linksRouter.get(
  '/',
  wrap(async (req, res) => {
    res.json({ links: await listLinks(req.auth!.tenantId) });
  }),
);

linksRouter.post(
  '/',
  wrap(async (req, res) => {
    const input = linkCreateSchema.parse(req.body);
    res.status(201).json({ link: await createLink(req.auth!.tenantId, input) });
  }),
);

linksRouter.put(
  '/reorder',
  wrap(async (req, res) => {
    const { ids } = reorderSchema.parse(req.body);
    res.json({ links: await reorderLinks(req.auth!.tenantId, ids) });
  }),
);

linksRouter.put(
  '/:id',
  wrap(async (req, res) => {
    const input = linkUpdateSchema.parse(req.body);
    res.json({ link: await updateLink(req.auth!.tenantId, req.params.id!, input) });
  }),
);

linksRouter.delete(
  '/:id',
  wrap(async (req, res) => {
    await deleteLink(req.auth!.tenantId, req.params.id!);
    res.status(204).end();
  }),
);
