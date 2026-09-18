import { describe, expect, it } from 'vitest';
import {
  AUTOROLL_SPEED_PX_PER_SEC,
  advanceCarouselAutoRoll,
  measureCarouselLoopWidth,
  normalizeCarouselLoopScroll,
} from '@/lib/ui/product-carousel-autoroll';

describe('product-carousel-autoroll', () => {
  it('exposes a slow continuous speed (not a step carousel)', () => {
    expect(AUTOROLL_SPEED_PX_PER_SEC).toBeGreaterThanOrEqual(12);
    expect(AUTOROLL_SPEED_PX_PER_SEC).toBeLessThanOrEqual(48);
  });

  it('measures loop width from primary set to first clone', () => {
    const track = document.createElement('div');
    track.style.position = 'relative';

    const a = document.createElement('div');
    a.setAttribute('data-product-slide', '');
    a.setAttribute('data-loop-set', '0');
    Object.defineProperty(a, 'offsetLeft', { value: 40 });

    const b = document.createElement('div');
    b.setAttribute('data-product-slide', '');
    b.setAttribute('data-loop-set', '0');
    Object.defineProperty(b, 'offsetLeft', { value: 300 });

    const clone = document.createElement('div');
    clone.setAttribute('data-product-slide', '');
    clone.setAttribute('data-loop-set', '1');
    Object.defineProperty(clone, 'offsetLeft', { value: 560 });

    track.append(a, b, clone);
    expect(measureCarouselLoopWidth(track)).toBe(520);
  });

  it('normalizes scroll across the loop boundary without negatives', () => {
    const track = document.createElement('div');
    let left = 1050;
    Object.defineProperty(track, 'scrollLeft', {
      configurable: true,
      get() {
        return left;
      },
      set(v: number) {
        left = v;
      },
    });
    track.scrollTo = ({ left: next }: ScrollToOptions) => {
      left = Number(next) || 0;
    };

    normalizeCarouselLoopScroll(track, 500);
    expect(track.scrollLeft).toBe(50);

    left = -20;
    normalizeCarouselLoopScroll(track, 500);
    expect(track.scrollLeft).toBe(480);
  });

  it('advances continuously and wraps at the loop width', () => {
    const track = document.createElement('div');
    let left = 490;
    Object.defineProperty(track, 'scrollLeft', {
      configurable: true,
      get() {
        return left;
      },
      set(v: number) {
        left = v;
      },
    });
    track.scrollBy = ({ left: delta }: ScrollToOptions) => {
      left += Number(delta) || 0;
    };
    track.scrollTo = ({ left: next }: ScrollToOptions) => {
      left = Number(next) || 0;
    };

    advanceCarouselAutoRoll(track, 500, 24);
    expect(track.scrollLeft).toBe(14);
  });
});
