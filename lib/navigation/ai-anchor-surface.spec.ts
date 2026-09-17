import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AI_ANCHOR_DESKTOP_MIN_WIDTH_PX,
  resolveAiAnchorSurface,
} from '@/lib/navigation/ai-anchor-surface';

describe('resolveAiAnchorSurface', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it(`uses sheet below ${AI_ANCHOR_DESKTOP_MIN_WIDTH_PX}px`, () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });
    expect(resolveAiAnchorSurface()).toBe('sheet');
  });

  it(`uses popover at or above ${AI_ANCHOR_DESKTOP_MIN_WIDTH_PX}px`, () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: true }),
    });
    expect(resolveAiAnchorSurface()).toBe('popover');
  });
});
