import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { BRAND } from '@/lib/constants/brand';
import { getAuthDatabasePool } from '@/lib/auth/database';
import { readAuthEnv } from '@/lib/auth/env';
import { sendTransactionalEmail } from '@/lib/email/send';
import { buildResetPasswordEmail } from '@/lib/email/templates/reset-password';
import { buildVerifyEmail } from '@/lib/email/templates/verify-email';
import { buildWelcomeEmail } from '@/lib/email/templates/welcome';

function buildTrustedOrigins(baseUrl: string): string[] {
  const origins = new Set<string>([
    baseUrl,
    BRAND.siteUrl,
    `https://${BRAND.domain}`,
    `https://www.${BRAND.domain}`,
  ]);

  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3001');
    origins.add('http://127.0.0.1:3001');
  }

  return [...origins];
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
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url }) => {
        const template = buildResetPasswordEmail({ url });
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
      sendVerificationEmail: async ({ user, url }) => {
        const template = buildVerifyEmail({ url });
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
    plugins: [nextCookies()],
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
