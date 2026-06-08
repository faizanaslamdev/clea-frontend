import { formatDateShort } from '@/lib/domain/format';
import { getProductById } from '@/lib/domain/products/catalog';
import { getStoreById } from '@/lib/domain/stores/catalog';
import type { MatchType, Product, Store } from '@/lib/types';

export function getLowestPriceStore(
  product: Product,
): { store: Store; price: number } | null {
  let lowestStoreId: string | null = null;
  let lowestPrice = Infinity;

  for (const [storeId, price] of Object.entries(product.prices)) {
    if (product.inStock[storeId] !== false && price < lowestPrice) {
      lowestPrice = price;
      lowestStoreId = storeId;
    }
  }

  if (!lowestStoreId) return null;

  return {
    store: {
      id: lowestStoreId,
      name: product.merchantName ?? lowestStoreId,
      country: 'Norway',
      currency: product.currency ?? 'NOK',
      coverImage: product.image,
    },
    price: lowestPrice,
  };
}

export async function getProductComparison(productId: string) {
  const product = await getProductById(productId);
  if (!product) return null;

  const entries = await Promise.all(
    Object.keys(product.prices).map(async (storeId) => {
      const store = (await getStoreById(storeId)) ?? {
        id: storeId,
        name: product.merchantName ?? storeId,
        country: 'Norway',
        currency: product.currency ?? 'NOK',
        coverImage: product.image,
      };
      return {
        store,
        price: product.prices[storeId] ?? null,
        inStock: product.inStock[storeId] ?? false,
      };
    }),
  );

  return { product, comparison: entries };
}

export async function getPriceChartData(productId: string, days: 7 | 15 | 30 = 30) {
  const product = await getProductById(productId);
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
