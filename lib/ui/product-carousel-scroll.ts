/**
 * Horizontal product carousel scroll helpers — native overflow scroll only.
 */

/** Gap between slides when computed style is unavailable (matches Tailwind gap-4). */
const FALLBACK_GAP_PX = 16;

/**
 * Distance to advance on previous/next: one full page of visible cards
 * (at least one card), so desktop controls move a sensible group rather
 * than a single awkward card jump.
 */
export function getCarouselScrollStep(track: HTMLElement): number {
  const slide = track.querySelector<HTMLElement>('[data-product-slide]');
  if (!slide) {
    return Math.max(1, Math.round(track.clientWidth * 0.85));
  }

  const styles = getComputedStyle(track);
  const gapRaw = styles.columnGap || styles.gap || '';
  const gap = Number.parseFloat(gapRaw);
  const pitch = slide.offsetWidth + (Number.isFinite(gap) ? gap : FALLBACK_GAP_PX);
  if (pitch <= 0) {
    return Math.max(1, Math.round(track.clientWidth * 0.85));
  }

  const visible = Math.max(1, Math.floor(track.clientWidth / pitch));
  return visible * pitch;
}

export function prefersReducedCarouselMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function carouselScrollBehavior(): ScrollBehavior {
  return prefersReducedCarouselMotion() ? 'auto' : 'smooth';
}
