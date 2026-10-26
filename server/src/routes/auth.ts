import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { config } from '../config.js';
import { wrap } from '../http/async.js';
import { clearSessionCookie, setSessionCookie } from '../http/cookies.js';
import { badRequest, forbidden, unauthorized } from '../http/errors.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createAccount,
  findProfileByTenant,
  findTenantByOwner,
  findUserByEmail,
  findUserById,
  updatePassword,
  verifyCredentials,
  touchLastLogin,
} from '../services/account.js';
import {
  createSession,
  deleteAllSessionsForUser,
  deleteOtherSessions,
  deleteSession,
} from '../services/sessions.js';
import { toProfileDto } from '../services/mappers.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validation/schemas.js';
import { verifyPassword } from '../auth/password.js';
import { consumePasswordReset, createPasswordReset } from '../services/password-reset.js';
import { sendEmail } from '../services/email.js';
import { getGoogleAuthUrl, verifyGoogleCode } from '../services/oauth-google.js';
import { getDb } from '../db/index.js';
import { slugify } from '../lib/slug.js';

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

authRouter.post(
  '/forgot-password',
  wrap(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await findUserByEmail(email);
    if (user) {
      const token = await createPasswordReset(user.id);
      const resetUrl = `${config.appBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
      const result = await sendEmail({
        to: user.email,
        subject: 'Reset your Pehchaan password',
        text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour and can only be used once.`,
        html: `<p>Reset your password:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 1 hour and can only be used once.</p>`,
      });
      if (!result.sent) {
        console.warn(`[auth] password reset email not sent for user ${user.id} (reason: ${result.reason})`);
        if (config.nodeEnv !== 'production') {
          console.warn(`[auth] DEV RESET URL (do not share): ${resetUrl}`);
        }
      }
    }
    // Generic response to avoid account enumeration
    res.json({ ok: true });
  }),
);

authRouter.post(
  '/reset-password',
  wrap(async (req, res) => {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const userId = await consumePasswordReset(token);
    if (!userId) throw badRequest('Invalid or expired reset link.');
    await updatePassword(userId, password);
    const { deleteAllSessionsForUser } = await import('../services/sessions.js');
    await deleteAllSessionsForUser(userId);
    res.json({ ok: true });
  }),
);

authRouter.get(
  '/google/url',
  wrap(async (_req, res) => {
    const state = randomBytes(16).toString('hex');
    // state is returned to client; in production store in httpOnly cookie/session
    const url = getGoogleAuthUrl(state);
    res.json({ url, state });
  }),
);

authRouter.get(
  '/google/callback',
  wrap(async (req, res) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const error = typeof req.query.error === 'string' ? req.query.error : '';
    if (error) {
      console.warn(`[auth] Google OAuth error: ${error}`);
      return res.redirect(`${config.appBaseUrl}/login?error=google`);
    }
    if (!code) {
      console.warn('[auth] Google OAuth callback missing code');
      return res.redirect(`${config.appBaseUrl}/login?error=google`);
    }
    try {
      const profile = await verifyGoogleCode(code);
      const db = await getDb();
      // Try to find by google_id first
      let { rows } = await db.query<{ id: string; email: string; role: string; status: string }>(
        'select id, email, role, status from users where google_id = $1 limit 1',
        [profile.sub],
      );
      let user = rows[0];
      if (!user) {
        // Try to link by verified email
        const existing = await findUserByEmail(profile.email);
        if (existing) {
          // Only link if we trust verified email from Google
          await db.query('update users set google_id = $1 where id = $2', [profile.sub, existing.id]);
          user = { id: existing.id, email: existing.email, role: existing.role, status: existing.status };
        } else {
          // Create new account
          const usernameBase = slugify(profile.name ?? profile.email.split('@')[0] ?? 'user');
          let username = usernameBase || 'user';
          // ensure unique
          for (let i = 0; i < 10; i++) {
            const check = await db.query('select 1 from profiles where username_lower = lower($1)', [username]);
            if (check.rows.length === 0) break;
            username = `${usernameBase}${Math.floor(Math.random() * 1000)}`;
          }
          const { user: newUser, tenant } = await createAccount({ email: profile.email, password: randomBytes(16).toString('hex'), displayName: profile.name, username });
          await db.query('update users set google_id = $1, email_verified_at = coalesce(email_verified_at, now()) where id = $2', [profile.sub, newUser.id]);
          user = { id: newUser.id, email: newUser.email, role: newUser.role, status: newUser.status };
        }
      }
      if (user.status !== 'active') return res.redirect(`${config.appBaseUrl}/login?error=suspended`);
      // @ts-ignore
      const resSess = await (createSession as any)(user.id);
      const token = resSess.token;
      const expiresAt = resSess.expiresAt;
      await touchLastLogin(user.id);
      setSessionCookie(res, token, expiresAt);
      res.redirect(`${config.appBaseUrl}/dashboard`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[auth] Google OAuth callback failed: ${msg}`);
      res.redirect(`${config.appBaseUrl}/login?error=google`);
    }
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
