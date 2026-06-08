import { getLowestPriceStore } from '@/lib/domain/products/comparison';
import type { Product } from '@/lib/types';

export function resolveStoreIdForProduct(
  product: Product,
  preferredStoreId?: string | null,
): string | null {
  if (
    preferredStoreId &&
    product.prices[preferredStoreId] != null &&
    product.inStock[preferredStoreId] !== false
  ) {
    return preferredStoreId;
  }
  return getLowestPriceStore(product)?.store.id ?? product.merchantId ?? null;
}
