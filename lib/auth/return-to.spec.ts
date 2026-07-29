import { describe, expect, it, beforeEach } from 'vitest';
import {
  AUTH_RETURN_TO_KEY,
  clearReturnTo,
  readReturnTo,
  resolvePostAuthReturnTo,
  sanitizeSafeReturnTo,
  saveReturnTo,
} from './return-to';

describe('sanitizeSafeReturnTo', () => {
  it('allows relative internal paths', () => {
    expect(sanitizeSafeReturnTo('/account')).toBe('/account');
    expect(sanitizeSafeReturnTo('/brands/nelly?x=1')).toBe('/brands/nelly?x=1');
  });

  it('rejects absolute, protocol-relative, and javascript URLs', () => {
    expect(sanitizeSafeReturnTo('https://evil.example')).toBe('/account');
    expect(sanitizeSafeReturnTo('//evil.example')).toBe('/account');
    expect(sanitizeSafeReturnTo('javascript:alert(1)')).toBe('/account');
    expect(sanitizeSafeReturnTo('/\\evil')).toBe('/account');
    expect(sanitizeSafeReturnTo('https://www.clea.no/account')).toBe(
      '/account',
    );
  });

  it('uses the provided fallback when invalid', () => {
    expect(sanitizeSafeReturnTo('https://x', '/brands')).toBe('/brands');
  });
});

describe('returnTo storage helpers', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('persists sanitized returnTo values', () => {
    saveReturnTo('/account');
    expect(readReturnTo()).toBe('/account');
    expect(sessionStorage.getItem(AUTH_RETURN_TO_KEY)).toBe('/account');
  });

  it('resolves pending returnTo over stored values', () => {
    saveReturnTo('/account');
    expect(
      resolvePostAuthReturnTo({
        pendingReturnTo: '/brands/nelly',
        queryReturnTo: '/faq',
      }),
    ).toBe('/brands/nelly');
  });

  it('clears stored returnTo', () => {
    saveReturnTo('/account');
    clearReturnTo();
    expect(sessionStorage.getItem(AUTH_RETURN_TO_KEY)).toBeNull();
  });
});
