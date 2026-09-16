'use client';

import type { SuitableFor } from '@/lib/api/chat-types';
import type { ShopBrowseState } from '@/lib/shop/shop-browse-params';

/** Minimum time Shop pending UI stays visible once a swap has started. */
export const SHOP_PENDING_MIN_MS = 400;

/**
 * Daydream-style taste line for in-category catalog swaps.
 * Specific filter/sort copy wins over the generic taste line.
 */
export function shopBrowsePendingLabel(input: {
  heading: string;
  state: ShopBrowseState;
  cold?: boolean;
}): string {
  const heading = input.heading.trim();
  const lower = heading.toLowerCase();

  if (input.cold) {
    return `Henter ${lower}`;
  }
  if (input.state.sort === 'price_asc') {
    return `Sorterer ${lower} etter laveste pris`;
  }
  if (input.state.sort === 'price_desc') {
    return `Sorterer ${lower} etter høyeste pris`;
  }
  if (input.state.onSale) {
    return `Finner ${lower} på salg`;
  }
  if (input.state.colour) {
    return `Henter ${lower} i valgt farge`;
  }
  if (input.state.minPrice != null || input.state.maxPrice != null) {
    return `Finner ${lower} i prisklassen din`;
  }
  if (input.state.brand) {
    return `Henter ${lower} fra ${input.state.brand}`;
  }
  if (input.state.merchantId) {
    return `Henter ${lower} fra butikken`;
  }
  return `Finner smaken din for: ${heading}`;
}

/** Hub navigation / audience-swap taste lines. */
export function shopHubPendingLabel(input: {
  navigating?: boolean;
  audienceSwapping?: boolean;
  suitableFor?: SuitableFor;
}): string {
  if (input.navigating) {
    return 'Åpner utvalget';
  }
  if (input.audienceSwapping) {
    return input.suitableFor === 'male'
      ? 'Bytter til herre'
      : 'Bytter til dame';
  }
  return 'Finner smaken din';
}
