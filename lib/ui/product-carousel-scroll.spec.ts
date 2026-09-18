import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  carouselScrollBehavior,
  getCarouselScrollStep,
  prefersReducedCarouselMotion,
} from '@/lib/ui/product-carousel-scroll';

describe('getCarouselScrollStep', () => {
  it('advances by the number of fully visible cards', () => {
    const track = document.createElement('div');
    Object.defineProperty(track, 'clientWidth', { value: 900 });
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      columnGap: '16px',
      gap: '16px',
    } as CSSStyleDeclaration);

    const slide = document.createElement('div');
    slide.setAttribute('data-product-slide', '');
    Object.defineProperty(slide, 'offsetWidth', { value: 270 });
    track.appendChild(slide);

    // pitch 286 → floor(900/286)=3 → 858
    expect(getCarouselScrollStep(track)).toBe(858);
  });

  it('advances at least one card when the viewport is narrow', () => {
    const track = document.createElement('div');
    Object.defineProperty(track, 'clientWidth', { value: 320 });
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      columnGap: '16px',
      gap: '16px',
    } as CSSStyleDeclaration);

    const slide = document.createElement('div');
    slide.setAttribute('data-product-slide', '');
    Object.defineProperty(slide, 'offsetWidth', { value: 210 });
    track.appendChild(slide);

    expect(getCarouselScrollStep(track)).toBe(226);
  });

  it('falls back without a slide element', () => {
    const track = document.createElement('div');
    Object.defineProperty(track, 'clientWidth', { value: 800 });
    expect(getCarouselScrollStep(track)).toBe(680);
  });
});

describe('carouselScrollBehavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses smooth scrolling by default', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    expect(prefersReducedCarouselMotion()).toBe(false);
    expect(carouselScrollBehavior()).toBe('smooth');
  });

  it('uses instant scrolling when reduced motion is preferred', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    expect(prefersReducedCarouselMotion()).toBe(true);
    expect(carouselScrollBehavior()).toBe('auto');
  });
});
