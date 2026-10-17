import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiError } from './backend-client';

describe('apiFetch timeout', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('turns a timeout into an ApiError with code "timeout"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(init.signal?.reason ?? new DOMException('aborted', 'AbortError')),
          );
        }),
      ),
    );
    const error = await apiFetch('/catalog', { timeoutMs: 20 }).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe('timeout');
  });

  it('passes a signal to fetch and returns JSON on success', async () => {
    const fetchMock = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiFetch<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true });
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
