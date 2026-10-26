import { OAuth2Client } from 'google-auth-library';
import { config } from '../config.js';

function assertGoogleConfig(): void {
  if (!config.googleClientId) throw new Error('GOOGLE_CLIENT_ID not configured');
  if (!config.googleClientSecret) throw new Error('GOOGLE_CLIENT_SECRET not configured');
  if (!config.googleRedirectUri) throw new Error('GOOGLE_REDIRECT_URI not configured');
}

export function getGoogleAuthUrl(state: string): string {
  assertGoogleConfig();
  const client = new OAuth2Client(config.googleClientId, config.googleClientSecret, config.googleRedirectUri);
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
    include_granted_scopes: true,
    prompt: 'select_account',
  });
  return url;
}

export async function verifyGoogleCode(code: string) {
  assertGoogleConfig();
  const client = new OAuth2Client(config.googleClientId, config.googleClientSecret, config.googleRedirectUri);
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google token');
    if (!payload.email_verified) throw new Error('Google email not verified');
    return {
      sub: payload.sub,
      email: payload.email!,
      name: payload.name ?? payload.email!,
      picture: payload.picture,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[oauth-google] verifyGoogleCode failed: ${msg}`);
    throw e;
  }
}
