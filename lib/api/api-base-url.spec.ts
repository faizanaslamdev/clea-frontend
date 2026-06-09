import { afterEach, describe, expect, it } from 'vitest';
import {
  isLoopbackHost,
  LOCAL_DEV_DEFAULT_API_URL,
  resolveApiBaseUrl,
  validateProductionApiUrl,
} from './api-base-url.mjs';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('isLoopbackHost', () => {
  it('detects localhost and IPv4/IPv6 loopback hosts', () => {
    expect(isLoopbackHost('localhost')).toBe(true);
    expect(isLoopbackHost('LOCALHOST')).toBe(true);
    expect(isLoopbackHost('127.0.0.1')).toBe(true);
    expect(isLoopbackHost('127.1.2.3')).toBe(true);
    expect(isLoopbackHost('::1')).toBe(true);
    expect(isLoopbackHost('[::1]')).toBe(true);
  });

  it('allows non-loopback hosts', () => {
    expect(isLoopbackHost('api.example.com')).toBe(false);
    expect(isLoopbackHost('localhost.example.com')).toBe(false);
  });
});

describe('validateProductionApiUrl', () => {
  it('accepts a public https URL and strips trailing slash', () => {
    expect(validateProductionApiUrl('https://api.example.com/')).toBe(
      'https://api.example.com',
    );
  });

  it('rejects missing values with an actionable message', () => {
    expect(() => validateProductionApiUrl(undefined)).toThrow(
      /NEXT_PUBLIC_API_URL is required for production builds/,
    );
    expect(() => validateProductionApiUrl('   ')).toThrow(
      /NEXT_PUBLIC_API_URL is required for production builds/,
    );
  });

  it('rejects invalid URLs', () => {
    expect(() => validateProductionApiUrl('not-a-url')).toThrow(
      /NEXT_PUBLIC_API_URL is not a valid URL/,
    );
  });

  it('rejects unsupported protocols', () => {
    expect(() => validateProductionApiUrl('ftp://api.example.com')).toThrow(
      /must use http or https/,
    );
  });

  it('rejects loopback hosts', () => {
    expect(() => validateProductionApiUrl('http://localhost:3000')).toThrow(
      /must not point to localhost or loopback/,
    );
    expect(() => validateProductionApiUrl('http://127.0.0.1:3000')).toThrow(
      /must not point to localhost or loopback/,
    );
    expect(() => validateProductionApiUrl('http://[::1]:3000')).toThrow(
      /must not point to localhost or loopback/,
    );
  });
});

describe('resolveApiBaseUrl', () => {
  it('falls back to local default in development when unset', () => {
    expect(
      resolveApiBaseUrl({ NODE_ENV: 'development', NEXT_PUBLIC_API_URL: undefined }),
    ).toBe(LOCAL_DEV_DEFAULT_API_URL);
  });

  it('uses configured URL in development', () => {
    expect(
      resolveApiBaseUrl({
        NODE_ENV: 'development',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000/',
      }),
    ).toBe('http://localhost:3000');
  });

  it('enforces production validation at runtime', () => {
    expect(() =>
      resolveApiBaseUrl({
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000',
      }),
    ).toThrow(/must not point to localhost or loopback/);
  });

  it('returns production URL when valid', () => {
    expect(
      resolveApiBaseUrl({
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://api.staging.example.com',
      }),
    ).toBe('https://api.staging.example.com');
  });

  it('does not require production URL during tests', () => {
    expect(
      resolveApiBaseUrl({ NODE_ENV: 'test', NEXT_PUBLIC_API_URL: undefined }),
    ).toBe(LOCAL_DEV_DEFAULT_API_URL);
  });
});
