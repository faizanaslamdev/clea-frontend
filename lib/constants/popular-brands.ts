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

/**
 * Total pool fetched once at the page level and shared (same React Query
 * key) by every home section that reads featured products. Sized larger
 * than what the "Populært nå" carousel itself displays
 * (TRENDING_DISPLAY_LIMIT) so other sections reusing this same pool
 * (FeatureTabsSection's Chat/Save tabs) can slice the leftover tail instead
 * of re-showing products already visible in that carousel.
 */
export const POPULAR_PRODUCTS_LIMIT = 32;

/** Products actually shown in the home "Populært nå" carousel. */
export const TRENDING_DISPLAY_LIMIT = 24;
