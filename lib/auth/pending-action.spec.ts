import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  AUTH_PENDING_ACTION_KEY,
  buildPendingActionResumeMessage,
  clearPendingAction,
  isValidProductId,
  parsePendingAction,
  readPendingAction,
  savePendingAction,
} from './pending-action';
import {
  cancelPendingTrackAction,
  consumePendingTrackAction,
  getPendingTrackResumeState,
} from './resume-pending-action';

const VALID_PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('pending-action', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips a valid track action and keeps it across reads', () => {
    savePendingAction({ type: 'track', productId: VALID_PRODUCT_ID });
    expect(readPendingAction()).toMatchObject({
      type: 'track',
      productId: VALID_PRODUCT_ID,
    });
    expect(readPendingAction()).not.toBeNull();
  });

  it('rejects invalid product ids', () => {
    expect(isValidProductId('not-a-uuid')).toBe(false);
    expect(savePendingAction({ type: 'track', productId: 'bad' })).toBeNull();
    expect(readPendingAction()).toBeNull();
  });

  it('does not clear on auth-success style re-reads', () => {
    savePendingAction({ type: 'track', productId: VALID_PRODUCT_ID });
    const first = readPendingAction();
    const second = readPendingAction();
    expect(first?.productId).toBe(VALID_PRODUCT_ID);
    expect(second?.productId).toBe(VALID_PRODUCT_ID);
    expect(sessionStorage.getItem(AUTH_PENDING_ACTION_KEY)).toBeTruthy();
  });

  it('clears only via explicit clear/cancel', () => {
    savePendingAction({ type: 'track', productId: VALID_PRODUCT_ID });
    clearPendingAction();
    expect(readPendingAction()).toBeNull();

    savePendingAction({ type: 'track', productId: VALID_PRODUCT_ID });
    cancelPendingTrackAction();
    expect(readPendingAction()).toBeNull();
  });

  it('sanitizes unsafe returnTo on parse', () => {
    expect(
      parsePendingAction({
        type: 'track',
        productId: VALID_PRODUCT_ID,
        returnTo: 'https://evil.example',
        createdAt: new Date().toISOString(),
      })?.returnTo,
    ).toBe('/account');
  });

  it('builds a resume message for track actions', () => {
    expect(
      buildPendingActionResumeMessage({
        type: 'track',
        productId: VALID_PRODUCT_ID,
        createdAt: new Date().toISOString(),
      }),
    ).toContain('prisvarsling');
  });
});

describe('resume-pending-action', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('is not ready until authenticated and verified', () => {
    savePendingAction({ type: 'track', productId: VALID_PRODUCT_ID });

    expect(
      getPendingTrackResumeState({ user: null }).isReadyToResume,
    ).toBe(false);

    expect(
      getPendingTrackResumeState({
        user: { id: 'u1', emailVerified: false },
      }).isReadyToResume,
    ).toBe(false);

    expect(
      getPendingTrackResumeState({
        user: { id: 'u1', emailVerified: true },
      }).isReadyToResume,
    ).toBe(true);
  });

  it('consumes pending action only after successful handler', async () => {
    savePendingAction({ type: 'track', productId: VALID_PRODUCT_ID });

    const failing = vi.fn(async () => {
      throw new Error('track failed');
    });

    await expect(consumePendingTrackAction(failing)).rejects.toThrow(
      'track failed',
    );
    expect(readPendingAction()?.productId).toBe(VALID_PRODUCT_ID);

    const ok = vi.fn(async () => undefined);
    const result = await consumePendingTrackAction(ok);
    expect(result.consumed).toBe(true);
    expect(ok).toHaveBeenCalledOnce();
    expect(readPendingAction()).toBeNull();
  });
});
