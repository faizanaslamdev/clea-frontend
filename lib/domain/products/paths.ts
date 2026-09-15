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

/** Canonical CLEA product detail URL (stable product UUID). */
export function getProductHref(
  productId: string,
  options?: { storeId?: string | null },
): string {
  const base = `/product/${productId}`;
  const storeId = options?.storeId?.trim();
  if (!storeId) return base;
  const params = new URLSearchParams({ store: storeId });
  return `${base}?${params.toString()}`;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isProductId(value: string): boolean {
  return UUID_RE.test(value);
}
