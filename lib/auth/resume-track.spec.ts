import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AUTH_PENDING_ACTION_KEY } from '@/lib/auth/pending-action';

const createTrack = vi.fn();

vi.mock('@/lib/api/tracks', () => ({
  createTrack: (...args: unknown[]) => createTrack(...args),
}));

describe('resumePendingProductTrack', () => {
  beforeEach(() => {
    sessionStorage.clear();
    createTrack.mockReset();
  });

  it('creates a track and clears pending action on success', async () => {
    const productId = '550e8400-e29b-41d4-a716-446655440000';
    sessionStorage.setItem(
      AUTH_PENDING_ACTION_KEY,
      JSON.stringify({
        type: 'track',
        productId,
        createdAt: new Date().toISOString(),
      }),
    );
    createTrack.mockResolvedValue({ id: 'track-1', productId });

    const { resumePendingProductTrack } = await import('./resume-track');
    const result = await resumePendingProductTrack();

    expect(createTrack).toHaveBeenCalledWith(productId);
    expect(result.consumed).toBe(true);
    expect(sessionStorage.getItem(AUTH_PENDING_ACTION_KEY)).toBeNull();
  });

  it('preserves pending action when createTrack fails', async () => {
    const productId = '550e8400-e29b-41d4-a716-446655440000';
    sessionStorage.setItem(
      AUTH_PENDING_ACTION_KEY,
      JSON.stringify({
        type: 'track',
        productId,
        createdAt: new Date().toISOString(),
      }),
    );
    createTrack.mockRejectedValue(new Error('network'));

    const { resumePendingProductTrack } = await import('./resume-track');
    await expect(resumePendingProductTrack()).rejects.toThrow('network');
    expect(sessionStorage.getItem(AUTH_PENDING_ACTION_KEY)).toBeTruthy();
  });
});
