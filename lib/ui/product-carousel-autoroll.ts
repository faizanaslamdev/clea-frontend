/**
 * Continuous auto-roll helpers for ProductCarousel (opt-in ticker / train).
 */

/** Slow premium rail speed — ~8s to travel one 270px desktop card. */
export const AUTOROLL_SPEED_PX_PER_SEC = 34;

/** Idle time after interaction before auto-roll resumes. */
export const AUTOROLL_RESUME_IDLE_MS = 1400;

/** Minimum overflow before auto-roll engages. */
export const AUTOROLL_MIN_OVERFLOW_PX = 32;

/**
 * Width of the primary (non-clone) slide set — used to wrap scrollLeft
 * seamlessly when content is rendered twice.
 */
export function measureCarouselLoopWidth(track: HTMLElement): number {
  const primary = track.querySelectorAll<HTMLElement>(
    '[data-product-slide][data-loop-set="0"]',
  );
  const firstClone = track.querySelector<HTMLElement>(
    '[data-product-slide][data-loop-set="1"]',
  );
  if (primary.length === 0 || !firstClone) {
    return 0;
  }
  return firstClone.offsetLeft - primary[0].offsetLeft;
}

/** Keep scrollLeft inside the primary loop window without a visible jump. */
export function normalizeCarouselLoopScroll(
  track: HTMLElement,
  loopWidth: number,
): void {
  if (loopWidth <= 0) return;
  let next = track.scrollLeft;
  while (next >= loopWidth) {
    next -= loopWidth;
  }
  while (next < 0) {
    next += loopWidth;
  }
  if (next !== track.scrollLeft) {
    // Chromium ignores direct scrollLeft writes under scroll-snap; use scrollTo.
    track.scrollTo({ left: next, behavior: 'instant' });
  }
}

export function advanceCarouselAutoRoll(
  track: HTMLElement,
  loopWidth: number,
  deltaPx: number,
): void {
  if (loopWidth <= 0 || deltaPx === 0) return;
  // scrollBy/scrollTo — not scrollLeft= — so snap/CSS smooth don't no-op the tick.
  track.scrollBy({ left: deltaPx, behavior: 'instant' });
  normalizeCarouselLoopScroll(track, loopWidth);
}
