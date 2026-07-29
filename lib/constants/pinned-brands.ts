/**
 * Brands pinned to the top of `/brands` when present in API data
 * with at least one product. Order here is display order.
 *
 * Matching is case-insensitive against `Store.name` (exact alias match).
 * Add aliases as the feed’s merchant_name appears in production.
 */
export type PinnedBrandConfig = {
  /** Stable key for logging / future merchant_id pins */
  key: string;
  /** Exact display-name aliases (case-insensitive) */
  names: readonly string[];
  /** Optional customer-facing name, independent of the feed merchant name. */
  displayName?: string;
};

export const PINNED_BRANDS: readonly PinnedBrandConfig[] = [
  {
    key: 'nlyman',
    names: ['NLYMAN', 'NLY Man', 'NLY Man NO'],
  },
  {
    key: 'nelly',
    names: ['Nelly.com', 'Nelly', 'Nelly NO'],
  },
  {
    key: 'ralph-lauren',
    names: ['Ralph Lauren', 'Ralph Lauren NO'],
    displayName: 'Ralph Lauren',
  },
];
