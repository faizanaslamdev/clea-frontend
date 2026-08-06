import type { Product, Store } from '@/lib/types';

export interface ListingPriceStore {
  store: Store;
  price: number;
  inStock: boolean;
}

function buildStore(product: Product, storeId: string): Store {
  return {
    id: storeId,
    name: product.merchantName ?? storeId,
    country: 'Norway',
    currency: product.currency ?? 'NOK',
    coverImage: product.image,
  };
}

/** Lowest in-stock offer — used when comparing live purchasable prices. */
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
    store: buildStore(product, lowestStoreId),
    price: lowestPrice,
  };
}

/**
 * Price shown on listing cards: prefer the listing merchant / in-stock offer,
 * but fall back to any listed price so out-of-stock variants still show price.
 */
export function getListingPriceStore(
  product: Product,
  preferredStoreId?: string,
): ListingPriceStore | null {
  if (preferredStoreId && product.prices[preferredStoreId] != null) {
    return {
      store: buildStore(product, preferredStoreId),
      price: product.prices[preferredStoreId],
      inStock: product.inStock[preferredStoreId] !== false,
    };
  }

  const inStock = getLowestPriceStore(product);
  if (inStock) {
    return {
      store: inStock.store,
      price: inStock.price,
      inStock: true,
    };
  }

  let lowestStoreId: string | null = null;
  let lowestPrice = Infinity;

  for (const [storeId, price] of Object.entries(product.prices)) {
    if (price < lowestPrice) {
      lowestPrice = price;
      lowestStoreId = storeId;
    }
  }

  if (!lowestStoreId) return null;

  return {
    store: buildStore(product, lowestStoreId),
    price: lowestPrice,
    inStock: product.inStock[lowestStoreId] !== false,
  };
}
