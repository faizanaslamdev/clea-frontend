import { PINNED_BRANDS } from '@/lib/constants/pinned-brands';
import type { Store } from '@/lib/types';

function normalizeBrandName(name: string): string {
  return name.trim().toLowerCase();
}

function storeHasProducts(store: Store): boolean {
  return (store.productCount ?? 0) > 0;
}

function matchesPinnedAlias(store: Store, aliases: readonly string[]): boolean {
  const name = normalizeBrandName(store.name);
  return aliases.some((alias) => normalizeBrandName(alias) === name);
}

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
    const match = available.find(
      (store) =>
        !usedIds.has(store.id) && matchesPinnedAlias(store, config.names),
    );
    if (match) {
      pinned.push(match);
      usedIds.add(match.id);
    }
  }

  const rest = available
    .filter((store) => !usedIds.has(store.id))
    .sort(compareStoresAlphabetical);

  return [...pinned, ...rest];
}
