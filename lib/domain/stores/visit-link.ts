import type { Store } from '@/lib/types';

export interface BrandVisitLinkOptions {
  /** Page or campaign referrer for affiliate / tracking (wired later). */
  referrer?: string;
}

export interface BrandVisitLink {
  href: string | null;
  isExternal: boolean;
}

/**
 * Builds the outbound storefront URL for a brand (with referral when configured).
 * Returns no href until brand URLs and tracking are connected.
 */
export function buildBrandVisitLink(
  store: Store,
  _options?: BrandVisitLinkOptions,
): BrandVisitLink {
  void store;

  return {
    href: null,
    isExternal: true,
  };
}
