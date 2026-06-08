import type { Product, Store } from '@/lib/types';

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
