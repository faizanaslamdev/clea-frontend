import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PRODUCT_DESKTOP_MODAL_MIN_WIDTH_PX,
  shouldOpenProductDesktopModal,
} from '@/lib/navigation/product-desktop-modal';

describe('shouldOpenProductDesktopModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the desktop modal at lg+ when not already on a product page', () => {
    vi.stubGlobal('window', {
      matchMedia: (query: string) => ({
        matches: query.includes(`${PRODUCT_DESKTOP_MODAL_MIN_WIDTH_PX}`),
      }),
      location: { pathname: '/chat/abc' },
    });

    expect(shouldOpenProductDesktopModal()).toBe(true);
  });

  it('uses the canonical product page on mobile/tablet viewports', () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
      location: { pathname: '/chat/abc' },
    });

    expect(shouldOpenProductDesktopModal()).toBe(false);
  });

  it('never overlays when already on /product/[id]', () => {
    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: true }),
      location: { pathname: '/product/11111111-1111-4111-8111-111111111111' },
    });

    expect(shouldOpenProductDesktopModal()).toBe(false);
  });
});
