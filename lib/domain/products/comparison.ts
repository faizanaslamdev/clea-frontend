import { stores } from '@/lib/data/dummy-data';
import { formatDateShort } from '@/lib/domain/format';
import { getProductById } from '@/lib/domain/products/catalog';
import { getStoreById } from '@/lib/domain/stores/catalog';
import type { MatchType, Product, Store } from '@/lib/types';

export function getLowestPriceStore(
  product: Product
): { store: Store; price: number } | null {
  let lowestStore: Store | null = null;
  let lowestPrice = Infinity;

  for (const [storeId, price] of Object.entries(product.prices)) {
    if (product.inStock[storeId] && price < lowestPrice) {
      lowestPrice = price;
      lowestStore = getStoreById(storeId) ?? null;
    }
  }

  return lowestStore ? { store: lowestStore, price: lowestPrice } : null;
}

export function getProductComparison(productId: string) {
  const product = getProductById(productId);
  if (!product) return null;

  const comparison = stores.map((store) => ({
    store,
    price: product.prices[store.id] ?? null,
    inStock: product.inStock[store.id] ?? false,
  }));

  return { product, comparison };
}

export function getPriceChartData(productId: string, days: 7 | 15 | 30 = 30) {
  const product = getProductById(productId);
  if (!product) return null;

  const slice = product.priceHistory.slice(-days);

  return slice.map((point) => ({
    date: formatDateShort(point.date),
    fullDate: point.date,
    price: point.price,
    store: point.store,
  }));
}

export function getMatchTypeLabel(matchType: MatchType): string {
  switch (matchType) {
    case 'exact':
      return 'Exact match — same SKU across stores';
    case 'near':
      return 'Near match — same brand & model family';
    case 'similar':
      return 'Similar alternative — comparable product';
    default:
      return '';
  }
}
