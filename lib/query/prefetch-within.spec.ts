import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { prefetchWithin } from './prefetch-within';
import { requirePrefetched } from './isr-guard';

describe('prefetchWithin', () => {
  it('includes data that arrives within the budget', async () => {
    const qc = new QueryClient();
    await prefetchWithin(qc, { queryKey: ['a'], queryFn: async () => 1 }, 200);
    expect(qc.getQueryData(['a'])).toBe(1);
  });

  it('returns at the budget without waiting for slow data', async () => {
    vi.useFakeTimers();
    const qc = new QueryClient();
    let settled = false;
    const done = prefetchWithin(
      qc,
      { queryKey: ['slow'], queryFn: () => new Promise((r) => setTimeout(() => r(2), 10_000)) },
      500,
    ).then(() => {
      settled = true;
    });
    await vi.advanceTimersByTimeAsync(500);
    await done;
    expect(settled).toBe(true);
    expect(qc.getQueryData(['slow'])).toBeUndefined();
    vi.useRealTimers();
  });
});

describe('requirePrefetched', () => {
  it('passes when every essential query succeeded', async () => {
    const qc = new QueryClient();
    await qc.prefetchQuery({ queryKey: ['ok'], queryFn: async () => 1 });
    expect(() => requirePrefetched(qc, 'home', [['ok']])).not.toThrow();
  });

  it('throws on revalidation so the previous page is kept', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const qc = new QueryClient();
    await qc.prefetchQuery({
      queryKey: ['bad'],
      queryFn: async () => {
        throw new Error('api down');
      },
      retry: false,
    });
    expect(() => requirePrefetched(qc, 'home', [['bad']])).toThrow(/keeping the previous page/);
    vi.unstubAllEnvs();
  });

  it('only warns in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => requirePrefetched(new QueryClient(), 'home', [['x']])).not.toThrow();
    warn.mockRestore();
    vi.unstubAllEnvs();
  });

  it('only warns during next build', async () => {
    const qc = new QueryClient();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PHASE', 'phase-production-build');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => requirePrefetched(qc, 'home', [['missing']])).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    vi.unstubAllEnvs();
  });
});
