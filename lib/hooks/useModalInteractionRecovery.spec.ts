import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isCoarsePointerDevice } from './useModalInteractionRecovery';

describe('useModalInteractionRecovery', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 1,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects coarse pointer devices', () => {
    expect(isCoarsePointerDevice()).toBe(true);
  });

  it('returns false on fine pointer devices without touch', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    });

    expect(isCoarsePointerDevice()).toBe(false);
  });
});
