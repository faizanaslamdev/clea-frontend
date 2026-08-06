import { getListingPriceStore } from '@/lib/domain/products/comparison';
import type { Product } from '@/lib/types';

export function resolveStoreIdForProduct(
  product: Product,
  preferredStoreId?: string | null,
): string | null {
  const listing = getListingPriceStore(
    product,
    preferredStoreId ?? undefined,
  );
  return listing?.store.id ?? product.merchantId ?? null;
}
