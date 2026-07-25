/**
 * Preferred merchants for the home "Populært nå" carousel.
 * Order = priority. Matched against live merchant_name aliases (case-insensitive).
 * Only brands present in API data with products are used — no placeholders.
 */
import type { PinnedBrandConfig } from '@/lib/constants/pinned-brands';

export const POPULAR_SECTION_BRANDS: readonly PinnedBrandConfig[] = [
  {
    key: 'nlyman',
    names: ['NLYMAN', 'NLY Man', 'NLY Man NO'],
  },
  {
    key: 'nelly',
    names: ['Nelly.com', 'Nelly'],
  },
  // Add more preferred brands here as catalog coverage grows:
  // { key: 'ralph-lauren', names: ['Ralph Lauren'] },
];

/** Max products taken from each preferred (or fallback) brand. */
export const POPULAR_PRODUCTS_PER_BRAND = 4;

/** Total products shown in the home carousel. */
export const POPULAR_PRODUCTS_LIMIT = 24;
