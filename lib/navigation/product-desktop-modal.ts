/**
 * Desktop/laptop product modal vs real `/product/[id]` route.
 * Matches Tailwind `lg` (1024px): tablets stay on the page route.
 */
export const PRODUCT_DESKTOP_MODAL_MIN_WIDTH_PX = 1024;

const DESKTOP_MODAL_MQ = `(min-width: ${PRODUCT_DESKTOP_MODAL_MIN_WIDTH_PX}px)`;

/**
 * Click-time check only — avoids hydration mismatches from React media hooks.
 * Direct `/product/...` URLs always use the full page, never the overlay.
 */
export function shouldOpenProductDesktopModal(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.matchMedia(DESKTOP_MODAL_MQ).matches) return false;
  if (window.location.pathname.startsWith('/product/')) return false;
  return true;
}
