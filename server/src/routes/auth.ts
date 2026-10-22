import { Router } from 'express';
import { config } from '../config.js';
import { wrap } from '../http/async.js';
import { clearSessionCookie, setSessionCookie } from '../http/cookies.js';
import { forbidden, unauthorized } from '../http/errors.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createAccount,
  findProfileByTenant,
  findTenantByOwner,
  updatePassword,
  verifyCredentials,
} from '../services/account.js';
import {
  createSession,
  deleteOtherSessions,
  deleteSession,
} from '../services/sessions.js';
import { toProfileDto } from '../services/mappers.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from '../validation/schemas.js';
import { verifyPassword } from '../auth/password.js';
import { findUserById, touchLastLogin } from '../services/account.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  wrap(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const { user, tenant, profile } = await createAccount(input);
    const { token, expiresAt } = await createSession(user.id, req.get('user-agent'));
    await touchLastLogin(user.id);
    setSessionCookie(res, token, expiresAt);
    res.status(201).json({
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
      tenant: { id: tenant.id, name: tenant.name },
      profile: toProfileDto(profile),
    });
  }),
);

authRouter.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await verifyCredentials(email, password);
    if (!user) throw unauthorized('Invalid email or password.');
    if (user.status !== 'active') throw forbidden('This account has been suspended.');
    const { token, expiresAt } = await createSession(user.id, req.get('user-agent'));
    await touchLastLogin(user.id);
    setSessionCookie(res, token, expiresAt);
    res.json({
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
    });
  }),
);

authRouter.post(
  '/logout',
  wrap(async (req, res) => {
    if (req.auth) await deleteSession(req.auth.token);
    clearSessionCookie(res);
    res.status(204).end();
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  wrap(async (req, res) => {
    const { user, tenantId } = req.auth!;
    const profile = await findProfileByTenant(tenantId);
    res.json({
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
      tenant: { id: tenantId },
      profile: profile
        ? { ...toProfileDto(profile), publicUrl: `${config.publicBaseUrl}/u/${profile.username}` }
        : null,
    });
  }),
);

authRouter.post(
  '/change-password',
  requireAuth,
  wrap(async (req, res) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const { user, token } = req.auth!;
    const full = await findUserById(user.id);
    if (!full || !(await verifyPassword(currentPassword, full.password_hash))) {
      throw unauthorized('Your current password is incorrect.');
    }
    await updatePassword(user.id, newPassword);
    await deleteOtherSessions(user.id, token);
    res.status(204).end();
  }),
);

authRouter.get(
  '/tenant',
  requireAuth,
  wrap(async (req, res) => {
    const tenant = await findTenantByOwner(req.auth!.user.id);
    res.json({ id: tenant?.id, name: tenant?.name });
  }),
);
