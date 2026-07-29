import { BRAND } from '@/lib/constants/brand';

export const MIN_BETTER_AUTH_SECRET_LENGTH = 32;

export interface AuthEnv {
  secret: string;
  baseUrl: string;
  databaseUrl: string;
  resendApiKey: string | undefined;
  emailFrom: string;
  crossSubDomainCookies: boolean;
  cookieDomain: string | undefined;
  isProduction: boolean;
}

function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`${name} is required for authentication.`);
  }
  return trimmed;
}

export function assertStrongBetterAuthSecret(secret: string): string {
  if (secret.length < MIN_BETTER_AUTH_SECRET_LENGTH) {
    throw new Error(
      `BETTER_AUTH_SECRET must be at least ${MIN_BETTER_AUTH_SECRET_LENGTH} characters.`,
    );
  }
  return secret;
}

function isProductionEnv(env: NodeJS.ProcessEnv): boolean {
  return (
    env.NODE_ENV === 'production' ||
    env.VERCEL_ENV === 'production' ||
    env.CLEA_RUNTIME === 'production'
  );
}

export function readAuthEnv(
  env: NodeJS.ProcessEnv = process.env,
): AuthEnv {
  const isProduction = isProductionEnv(env);

  const baseUrl =
    env.BETTER_AUTH_URL?.trim() ||
    env.NEXT_PUBLIC_APP_URL?.trim() ||
    (isProduction ? BRAND.siteUrl : 'http://localhost:3001');

  const databaseUrl = env.DATABASE_URL?.trim() || env.AUTH_DATABASE_URL?.trim();
  const secret = assertStrongBetterAuthSecret(
    requireEnv('BETTER_AUTH_SECRET', env.BETTER_AUTH_SECRET),
  );

  const resendApiKey = env.RESEND_API_KEY?.trim() || undefined;
  if (isProduction && !resendApiKey) {
    throw new Error(
      'RESEND_API_KEY is required in production for authentication emails.',
    );
  }

  const crossSubDomainCookies =
    env.BETTER_AUTH_CROSS_SUBDOMAIN_COOKIES === 'true' ||
    (env.BETTER_AUTH_CROSS_SUBDOMAIN_COOKIES !== 'false' && isProduction);

  const cookieDomain =
    env.BETTER_AUTH_COOKIE_DOMAIN?.trim() ||
    (crossSubDomainCookies ? `.${BRAND.domain}` : undefined);

  return {
    secret,
    baseUrl,
    databaseUrl: requireEnv('DATABASE_URL or AUTH_DATABASE_URL', databaseUrl),
    resendApiKey,
    emailFrom:
      env.AUTH_EMAIL_FROM?.trim() ||
      `Clea <noreply@${BRAND.domain}>`,
    crossSubDomainCookies,
    cookieDomain,
    isProduction,
  };
}

export function isAuthEnvConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  try {
    readAuthEnv(env);
    return true;
  } catch {
    return false;
  }
}
