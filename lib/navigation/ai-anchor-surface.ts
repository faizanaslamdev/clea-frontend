import { PRODUCT_DESKTOP_MODAL_MIN_WIDTH_PX } from '@/lib/navigation/product-desktop-modal';

/**
 * AI product-anchor presentation breakpoint.
 * Matches Tailwind `lg` / product desktop modal (1024px):
 * below → bottom sheet; at/above → existing floating popover.
 */
export const AI_ANCHOR_DESKTOP_MIN_WIDTH_PX = PRODUCT_DESKTOP_MODAL_MIN_WIDTH_PX;

const AI_ANCHOR_DESKTOP_MQ = `(min-width: ${AI_ANCHOR_DESKTOP_MIN_WIDTH_PX}px)`;

export type AiAnchorSurface = 'sheet' | 'popover';

/** Click-time check — same pattern as {@link shouldOpenProductDesktopModal}. */
export function resolveAiAnchorSurface(): AiAnchorSurface {
  if (typeof window === 'undefined') return 'sheet';
  return window.matchMedia(AI_ANCHOR_DESKTOP_MQ).matches ? 'popover' : 'sheet';
}
