import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { BRAND } from '@/lib/constants/brand';
import { getAuthDatabasePool } from '@/lib/auth/database';
import { readAuthEnv } from '@/lib/auth/env';
import { sendTransactionalEmail } from '@/lib/email/send';
import { AUTH_TOKEN_EXPIRES_IN_SECONDS } from '@/lib/email/layout';
import { buildPasswordChangedEmail } from '@/lib/email/templates/password-changed';
import { buildResetPasswordEmail } from '@/lib/email/templates/reset-password';
import {
  buildVerifyEmail,
  emailLangFromVerifyUrl,
} from '@/lib/email/templates/verify-email';
import { buildWelcomeEmail } from '@/lib/email/templates/welcome';

function buildTrustedOrigins(baseUrl: string): string[] {
  const origins = new Set<string>([
    baseUrl,
    BRAND.siteUrl,
    `https://${BRAND.domain}`,
    `https://www.${BRAND.domain}`,
    // Clea mobile app (React Native) sends this Origin on auth requests.
    'clea://',
  ]);

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3001');
    origins.add('http://127.0.0.1:3001');
  }

  return [...origins];
}

/**
 * Price alerts and push devices live in backend-owned tables keyed by the auth user id
 * (no foreign key), so remove them when the account is deleted. Missing tables are ignored.
 */
async function deleteUserOwnedRows(userId: string): Promise<void> {
  const pool = getAuthDatabasePool();
  for (const table of ['product_tracks', 'push_devices']) {
    try {
      await pool.query(`DELETE FROM "${table}" WHERE "user_id" = $1`, [userId]);
    } catch (error) {
      if ((error as { code?: string }).code !== '42P01') {
        console.error(`[auth] failed to delete ${table} rows for deleted user`, error);
      }
    }
  }
}

function createAuthInstance() {
  const env = readAuthEnv();

  return betterAuth({
    appName: BRAND.name,
    baseURL: env.baseUrl,
    secret: env.secret,
    database: getAuthDatabasePool(),
    trustedOrigins: buildTrustedOrigins(env.baseUrl),
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': {
          window: 10,
          max: 5,
        },
        '/sign-up/email': {
          window: 60,
          max: 5,
        },
        '/request-password-reset': {
          window: 60,
          max: 3,
        },
        '/forget-password': {
          window: 60,
          max: 3,
        },
        '/send-verification-email': {
          window: 60,
          max: 3,
        },
      },
    },
    user: {
      deleteUser: {
        // App Store guideline 5.1.1(v): accounts created in the app must be deletable in the app.
        // The endpoint requires the current password.
        enabled: true,
        afterDelete: async (user) => {
          await deleteUserOwnedRows(user.id);
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      resetPasswordTokenExpiresIn: AUTH_TOKEN_EXPIRES_IN_SECONDS,
      sendResetPassword: async ({ user, url }) => {
        const template = buildResetPasswordEmail({
          url,
          expiresInSeconds: AUTH_TOKEN_EXPIRES_IN_SECONDS,
        });
        await sendTransactionalEmail({
          to: user.email,
          ...template,
        });
      },
      onPasswordReset: async ({ user }) => {
        const template = buildPasswordChangedEmail({ name: user.name });
        await sendTransactionalEmail({
          to: user.email,
          ...template,
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: AUTH_TOKEN_EXPIRES_IN_SECONDS,
      sendVerificationEmail: async ({ user, url }) => {
        const template = buildVerifyEmail({
          url,
          expiresInSeconds: AUTH_TOKEN_EXPIRES_IN_SECONDS,
          lang: emailLangFromVerifyUrl(url),
        });
        await sendTransactionalEmail({
          to: user.email,
          ...template,
        });
      },
      afterEmailVerification: async (user) => {
        const template = buildWelcomeEmail({ name: user.name });
        await sendTransactionalEmail({
          to: user.email,
          ...template,
        });
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    advanced: {
      crossSubDomainCookies: env.crossSubDomainCookies
        ? {
            enabled: true,
            domain: env.cookieDomain ?? `.${BRAND.domain}`,
          }
        : undefined,
      defaultCookieAttributes: {
        secure: env.isProduction,
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
      },
    },
    // bearer(): the mobile app authenticates with `Authorization: Bearer` (token from the
    // `set-auth-token` response header) instead of cookies. nextCookies() must stay last.
    plugins: [bearer(), nextCookies()],
  });
}

type AuthInstance = ReturnType<typeof createAuthInstance>;

let authInstance: AuthInstance | undefined;

export function getAuth(): AuthInstance {
  if (!authInstance) {
    authInstance = createAuthInstance();
  }

  return authInstance;
}

export type Session = AuthInstance['$Infer']['Session'];
export type User = Session['user'];
