import { PINNED_BRANDS } from '@/lib/constants/pinned-brands';
import {
  matchesMerchantAliases,
  storeHasProducts,
} from '@/lib/domain/stores/merchant-match';
import type { Store } from '@/lib/types';

function compareStoresAlphabetical(a: Store, b: Store): number {
  return a.name.localeCompare(b.name, 'nb', { sensitivity: 'base' });
}

/**
 * Pins configured brands (that exist in `stores` and have products) to the
 * front in PINNED_BRANDS order. Remaining stores keep alphabetical order.
 * Never invents placeholder brands.
 */
export function sortStoresWithPinned(stores: Store[]): Store[] {
  const available = stores.filter(storeHasProducts);
  const usedIds = new Set<string>();
  const pinned: Store[] = [];

  for (const config of PINNED_BRANDS) {
    const matches = available.filter(
      (store) => matchesMerchantAliases(store, config.names),
    );
    const match = matches.find((store) => !usedIds.has(store.id));
    if (match) {
      pinned.push(match);
      // Alias variants represent the same card; keep only the first live match.
      matches.forEach((store) => usedIds.add(store.id));
    }
  }

  const rest = available
    .filter((store) => !usedIds.has(store.id))
    .sort(compareStoresAlphabetical);

  return [...pinned, ...rest];
}
