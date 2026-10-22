import { Router } from 'express';
import { config } from '../config.js';
import { wrap } from '../http/async.js';
import { requireAuth } from '../middleware/auth.js';
import { toProfileDto } from '../services/mappers.js';
import {
  getProfileByTenant,
  setPublished,
  updateAppearance,
  updateProfile,
  updateTheme,
  updateUsername,
} from '../services/profile.js';
import {
  appearanceSchema,
  profileUpdateSchema,
  publishSchema,
  themeSchema,
  usernameUpdateSchema,
} from '../validation/schemas.js';
import type { ProfileRow } from '../services/types.js';

export const profileRouter = Router();

function withUrl(p: ProfileRow) {
  return { ...toProfileDto(p), publicUrl: `${config.publicBaseUrl}/u/${p.username}` };
}

profileRouter.use(requireAuth);

profileRouter.get(
  '/',
  wrap(async (req, res) => {
    const profile = await getProfileByTenant(req.auth!.tenantId);
    res.json({ profile: withUrl(profile) });
  }),
);

profileRouter.put(
  '/',
  wrap(async (req, res) => {
    const input = profileUpdateSchema.parse(req.body);
    const profile = await updateProfile(req.auth!.tenantId, input);
    res.json({ profile: withUrl(profile) });
  }),
);

profileRouter.put(
  '/username',
  wrap(async (req, res) => {
    const { username } = usernameUpdateSchema.parse(req.body);
    const profile = await updateUsername(req.auth!.tenantId, username);
    res.json({ profile: withUrl(profile) });
  }),
);

profileRouter.put(
  '/theme',
  wrap(async (req, res) => {
    const input = themeSchema.parse(req.body);
    const profile = await updateTheme(req.auth!.tenantId, input);
    res.json({ profile: withUrl(profile) });
  }),
);

profileRouter.put(
  '/appearance',
  wrap(async (req, res) => {
    const input = appearanceSchema.parse(req.body);
    const profile = await updateAppearance(req.auth!.tenantId, input);
    res.json({ profile: withUrl(profile) });
  }),
);

profileRouter.post(
  '/publish',
  wrap(async (req, res) => {
    const { isPublished } = publishSchema.parse(req.body);
    const profile = await setPublished(req.auth!.tenantId, isPublished);
    res.json({ profile: withUrl(profile) });
  }),
);
