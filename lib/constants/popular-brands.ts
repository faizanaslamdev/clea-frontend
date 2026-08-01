/**
 * Preferred merchants for curated multi-brand surfaces.
 * Home "Populært nå" now uses a single balanced `/catalog` request for speed;
 * keep this list for future curated surfaces / docs.
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
];

/** Max products taken from each merchant in the balanced popular catalog. */
export const POPULAR_PRODUCTS_PER_BRAND = 4;

/** Total products shown in the home carousel. */
export const POPULAR_PRODUCTS_LIMIT = 24;
