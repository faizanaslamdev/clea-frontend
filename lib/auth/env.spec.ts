import { describe, expect, it } from 'vitest';
import {
  assertStrongBetterAuthSecret,
  isAuthEnvConfigured,
  readAuthEnv,
} from './env';

describe('assertStrongBetterAuthSecret', () => {
  it('rejects short secrets', () => {
    expect(() => assertStrongBetterAuthSecret('short')).toThrow(/at least 32/);
  });

  it('accepts secrets with at least 32 characters', () => {
    expect(assertStrongBetterAuthSecret('x'.repeat(32))).toHaveLength(32);
  });
});

describe('readAuthEnv', () => {
  it('requires secret and database url', () => {
    expect(() =>
      readAuthEnv({
        BETTER_AUTH_SECRET: 'x'.repeat(32),
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it('rejects weak secrets', () => {
    expect(() =>
      readAuthEnv({
        BETTER_AUTH_SECRET: 'too-short',
        DATABASE_URL: 'postgresql://localhost/clea',
      }),
    ).toThrow(/at least 32/);
  });

  it('requires Resend in production', () => {
    expect(() =>
      readAuthEnv({
        NODE_ENV: 'production',
        BETTER_AUTH_SECRET: 'x'.repeat(32),
        DATABASE_URL: 'postgresql://localhost/clea',
        BETTER_AUTH_URL: 'https://www.clea.no',
      }),
    ).toThrow(/RESEND_API_KEY/);
  });

  it('enables cross-subdomain cookies by default in production', () => {
    const env = readAuthEnv({
      NODE_ENV: 'production',
      BETTER_AUTH_SECRET: 'x'.repeat(32),
      DATABASE_URL: 'postgresql://localhost/clea',
      BETTER_AUTH_URL: 'https://www.clea.no',
      RESEND_API_KEY: 're_test',
    });

    expect(env.crossSubDomainCookies).toBe(true);
    expect(env.cookieDomain).toBe('.clea.no');
  });

  it('reads configured values in development', () => {
    const env = readAuthEnv({
      NODE_ENV: 'development',
      BETTER_AUTH_SECRET: 'x'.repeat(32),
      DATABASE_URL: 'postgresql://localhost/clea',
      BETTER_AUTH_URL: 'http://localhost:3001',
    });

    expect(env.baseUrl).toBe('http://localhost:3001');
    expect(env.crossSubDomainCookies).toBe(false);
  });
});

describe('isAuthEnvConfigured', () => {
  it('returns false when auth env is incomplete', () => {
    expect(isAuthEnvConfigured({})).toBe(false);
  });

  it('returns true when required values exist', () => {
    expect(
      isAuthEnvConfigured({
        NODE_ENV: 'development',
        BETTER_AUTH_SECRET: 'x'.repeat(32),
        DATABASE_URL: 'postgresql://localhost/clea',
      }),
    ).toBe(true);
  });
});
