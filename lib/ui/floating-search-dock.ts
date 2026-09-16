/**
 * Shared floating compact-search helpers.
 *
 * Landing sticky search (header) hides near the footer on mobile.
 * Shop browse assistant uses CSS `position: sticky` inside
 * `.shop-browse-assistant-scope` — FLOATING → LAND → DOCKED with no
 * fixed↔relative mode switch.
 */

/** Hide bottom sticky search when footer enters this zone (home/mobile). */
export const STICKY_SEARCH_FOOTER_CLEARANCE_PX = 112;

/**
 * Resting clearance from the viewport bottom while the shop assistant is
 * stuck — matches `.shop-browse-assistant-anchor` margin-bottom when released.
 */
export const FLOATING_SEARCH_MIN_BOTTOM_PX = 24;

export function isFooterNearStickySearch(
  clearancePx = STICKY_SEARCH_FOOTER_CLEARANCE_PX,
): boolean {
  const footer = document.querySelector('.site-footer');
  if (!footer) return false;
  const { top } = footer.getBoundingClientRect();
  return top < window.innerHeight - clearancePx;
}
