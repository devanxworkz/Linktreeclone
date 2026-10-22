import { Router } from 'express';
import { wrap } from '../http/async.js';
import { notFound } from '../http/errors.js';
import { getPublicPage } from '../services/profile.js';
import { recordLinkClickByUsername, recordViewByUsername } from '../services/analytics.js';
import { viewSchema } from '../validation/schemas.js';

export const publicRouter = Router();

publicRouter.get(
  '/:username',
  wrap(async (req, res) => {
    const page = await getPublicPage(req.params.username!);
    if (!page) throw notFound('That creator page does not exist.');
    res.json({ page });
  }),
);

publicRouter.post(
  '/:username/view',
  wrap(async (req, res) => {
    const { referrer } = viewSchema.parse(req.body ?? {});
    await recordViewByUsername(req.params.username!, `/u/${req.params.username}`, referrer);
    res.status(204).end();
  }),
);

publicRouter.post(
  '/:username/click/:linkId',
  wrap(async (req, res) => {
    await recordLinkClickByUsername(req.params.username!, req.params.linkId!);
    res.status(204).end();
  }),
);
