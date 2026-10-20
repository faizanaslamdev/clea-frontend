import { afterEach, describe, expect, it } from 'vitest';
import { serverOnlyHeaders } from './backend-client';

describe('serverOnlyHeaders', () => {
  const original = process.env.CLEA_SSR_API_KEY;
  afterEach(() => {
    process.env.CLEA_SSR_API_KEY = original;
  });

  it('adds the shared key on the server when configured', () => {
    process.env.CLEA_SSR_API_KEY = 'k'.repeat(32);
    const w = (globalThis as { window?: unknown }).window;
    if (w === undefined) {
      expect(serverOnlyHeaders()).toEqual({ 'x-clea-ssr-key': 'k'.repeat(32) });
    } else {
      expect(serverOnlyHeaders()).toEqual({});
    }
  });

  it('adds nothing when the key is not configured', () => {
    delete process.env.CLEA_SSR_API_KEY;
    expect(serverOnlyHeaders()).toEqual({});
  });
});
