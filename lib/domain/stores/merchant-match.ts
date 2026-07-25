import type { PinnedBrandConfig } from '@/lib/constants/pinned-brands';
import type { Store } from '@/lib/types';

export function normalizeMerchantName(name: string): string {
  return name.trim().toLowerCase();
}

export function storeHasProducts(store: Store): boolean {
  return (store.productCount ?? 0) > 0;
}

export function matchesMerchantAliases(
  store: Store,
  aliases: readonly string[],
): boolean {
  const name = normalizeMerchantName(store.name);
  return aliases.some((alias) => normalizeMerchantName(alias) === name);
}

/** Resolve configured brands to live stores that have products, in config order. */
export function resolvePreferredStores(
  stores: Store[],
  preferred: readonly PinnedBrandConfig[],
): Store[] {
  const available = stores.filter(storeHasProducts);
  const usedIds = new Set<string>();
  const resolved: Store[] = [];

  for (const config of preferred) {
    const match = available.find(
      (store) =>
        !usedIds.has(store.id) && matchesMerchantAliases(store, config.names),
    );
    if (match) {
      resolved.push(match);
      usedIds.add(match.id);
    }
  }

  return resolved;
}
